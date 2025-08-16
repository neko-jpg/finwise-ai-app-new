'use server';

// ★★★ 変更点: インポートパスを '@genkit-ai/core' に修正 ★★★
import { defineFlow, run, startFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { PlaidApi, Configuration, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { doc, setDoc, getDoc, writeBatch, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createTransactionHash } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

// Plaid client configuration
const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

// Zod schemas for flow inputs
const CreateLinkTokenInputSchema = z.object({
  userId: z.string(),
});

const ExchangePublicTokenInputSchema = z.object({
  publicToken: z.string(),
  familyId: z.string(),
});

/**
 * Flow to create a Plaid Link token.
 */
export const createLinkToken = defineFlow(
  {
    name: 'createLinkToken',
    inputSchema: CreateLinkTokenInputSchema,
    outputSchema: z.string(),
  },
  async ({ userId }) => {
    const request = {
      user: { client_user_id: userId },
      client_name: 'Finwise AI',
      products: [Products.Investments, Products.Transactions],
      country_codes: [
        CountryCode.Us,
        CountryCode.Ca,
        CountryCode.Gb,
        CountryCode.Fr,
        CountryCode.Es,
        CountryCode.Ie,
        CountryCode.Nl,
      ],
      language: 'en',
    };
    try {
      const response = await plaidClient.linkTokenCreate(request);
      return response.data.link_token;
    } catch (error) {
      console.error("Error creating Plaid link token:", error);
      throw new Error("Failed to create Plaid link token.");
    }
  }
);

/**
 * Flow to sync transaction data for all Plaid Items for a given family.
 */
export const syncAllTransactions = defineFlow(
    {
        name: 'syncAllTransactions',
        inputSchema: z.object({ familyId: z.string() }),
        outputSchema: z.object({ success: z.boolean(), syncedItems: z.number() }),
    },
    async ({ familyId }) => {
        const plaidItemsRef = collection(db, 'plaid_items');
        const q = query(plaidItemsRef, where("familyId", "==", familyId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`No Plaid items found for family ${familyId}`);
            return { success: true, syncedItems: 0 };
        }

        const syncPromises = querySnapshot.docs.map(doc =>
            startFlow(syncTransactions, { plaidItemId: doc.id, familyId })
        );

        await Promise.all(syncPromises);

        return { success: true, syncedItems: querySnapshot.size };
    }
);


/**
 * Flow to sync transaction data for a given Plaid Item.
 */
export const syncTransactions = defineFlow(
  {
    name: 'syncTransactions',
    inputSchema: z.object({
        plaidItemId: z.string(),
        familyId: z.string(),
    }),
    outputSchema: z.object({ success: z.boolean(), added: z.number() }),
  },
  async ({ plaidItemId, familyId }) => {
    const itemRef = doc(db, 'plaid_items', plaidItemId);
    const itemDoc = await getDoc(itemRef);
    if (!itemDoc.exists()) throw new Error(`Plaid item ${plaidItemId} not found.`);

    const { accessToken, transactionsCursor: lastCursor } = itemDoc.data();

    let cursor = lastCursor || null;
    let added: any[] = [];
    let modified: any[] = [];
    let removed: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const request = {
        access_token: accessToken,
        cursor: cursor,
      };
      const response = await plaidClient.transactionsSync(request);
      const data = response.data;

      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }

    const txCollectionRef = collection(db, `families/${familyId}/transactions`);
    const batch = writeBatch(db);

    // Process added transactions
    for (const plaidTx of added) {
        const hash = createTransactionHash({
            bookedAt: new Date(plaidTx.date),
            amount: plaidTx.amount * -1, // Plaid amounts are positive for expenses
            merchant: plaidTx.merchant_name || plaidTx.name,
        });

        const newTx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'clientUpdatedAt' > = {
            amount: plaidTx.amount * -1,
            originalAmount: plaidTx.amount,
            originalCurrency: plaidTx.iso_currency_code,
            merchant: plaidTx.merchant_name || plaidTx.name,
            bookedAt: new Date(plaidTx.date),
            category: { major: 'other' }, // Default category
            source: 'plaid',
            scope: 'personal', // Default scope
            familyId,
            plaidTransactionId: plaidTx.transaction_id,
            plaidAccountId: plaidTx.account_id,
            hash,
        };
        const docRef = doc(txCollectionRef); // Create a new doc with a random ID
        batch.set(docRef, { ...newTx, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }

    // TODO: Handle modified and removed transactions
    console.log(`[${plaidItemId}] Added ${added.length} transactions.`);

    // Update the cursor on the Plaid item
    batch.update(itemRef, { transactionsCursor: cursor, updatedAt: serverTimestamp() });

    await batch.commit();

    return { success: true, added: added.length };
  }
);

/**
 * Flow to exchange a public token for an access token and trigger initial sync.
 */
export const exchangePublicToken = defineFlow(
  {
    name: 'exchangePublicToken',
    inputSchema: ExchangePublicTokenInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ publicToken, familyId }) => {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
      const institutionName = itemResponse.data.item.institution_id
        ? (await plaidClient.institutionsGetById({ institution_id: itemResponse.data.item.institution_id, country_codes: [CountryCode.Us, CountryCode.Ca, CountryCode.Gb, CountryCode.Fr, CountryCode.Es, CountryCode.Ie, CountryCode.Nl] })).data.institution.name
        : 'Unknown Institution';

      const plaidItemRef = doc(db, 'plaid_items', itemId);
      await setDoc(plaidItemRef, {
        id: itemId,
        familyId: familyId,
        accessToken: accessToken,
        institutionName: institutionName,
        createdAt: serverTimestamp(),
      });

      // Trigger the initial sync in the background (don't await it)
      startFlow(syncInvestments, { plaidItemId: itemId, familyId });

      return { success: true };
    } catch (error) {
      console.error("Error exchanging public token:", error);
      throw new Error("Failed to exchange public token.");
    }
  }
);


/**
 * Flow to sync investment data for a given Plaid Item.
 */
export const syncInvestments = defineFlow(
  {
    name: 'syncInvestments',
    inputSchema: z.object({
      plaidItemId: z.string(),
      familyId: z.string(),
    }),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ plaidItemId, familyId }) => {
    try {
      const itemRef = doc(db, 'plaid_items', plaidItemId);
      const itemDoc = await getDoc(itemRef);
      if (!itemDoc.exists()) throw new Error(`Plaid item ${plaidItemId} not found.`);
      const accessToken = itemDoc.data().accessToken;

      const holdingsResponse = await plaidClient.investmentsHoldingsGet({ access_token: accessToken });
      const { accounts, holdings, securities } = holdingsResponse.data;

      const batch = writeBatch(db);
      const now = serverTimestamp();

      for (const security of securities) {
        const securityRef = doc(db, 'securities', security.security_id);
        batch.set(securityRef, {
          id: security.security_id,
          name: security.name,
          tickerSymbol: security.ticker_symbol,
          type: security.type,
          closePrice: security.close_price,
          updatedAt: now,
        }, { merge: true });
      }

      for (const account of accounts) {
        const accountRef = doc(db, 'investment_accounts', account.account_id);
        batch.set(accountRef, {
          id: account.account_id,
          familyId: familyId,
          plaidItemId: plaidItemId,
          name: account.name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
          currentBalance: account.balances.current,
          updatedAt: now,
        });
      }

      for (const holding of holdings) {
        const holdingId = `${holding.account_id}-${holding.security_id}`;
        const holdingRef = doc(db, 'holdings', holdingId);
        batch.set(holdingRef, {
          id: holdingId,
          familyId: familyId,
          plaidAccountId: holding.account_id,
          securityId: holding.security_id,
          quantity: holding.quantity,
          institutionValue: holding.institution_value,
          costBasis: holding.cost_basis,
          updatedAt: now,
        });
      }

      await batch.commit();

      console.log(`Successfully synced investments for item ${plaidItemId}`);
      return { success: true };

    } catch (error) {
      console.error("Error syncing investments:", error);
      throw new Error("Failed to sync investments.");
    }
  }
);
