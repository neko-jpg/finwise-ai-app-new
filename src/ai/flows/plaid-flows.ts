'use server';

import { z } from 'genkit';
import { PlaidApi, Configuration, PlaidEnvironments, Products, CountryCode, Transaction as PlaidTransactionResponse } from 'plaid';
import { doc, setDoc, getDoc, writeBatch, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { createTransactionHash } from '@/lib/utils';
import type { Transaction } from '@/lib/domain';
import { defineFlow } from '@/ai/compat';
import { txConverter } from '@/lib/repo';

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

const CreateLinkTokenInputSchema = z.object({ userId: z.string() });
type CreateLinkTokenInput = z.infer<typeof CreateLinkTokenInputSchema>;

export const createLinkToken = defineFlow(
  'createLinkToken',
  { input: CreateLinkTokenInputSchema, output: z.string() },
  async ({ userId }: CreateLinkTokenInput) => {
    const request = {
      user: { client_user_id: userId },
      client_name: 'Finwise AI',
      products: [Products.Investments, Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Ca, CountryCode.Gb, CountryCode.Fr, CountryCode.Es, CountryCode.Ie, CountryCode.Nl],
      language: 'en',
    };
    const response = await plaidClient.linkTokenCreate(request);
    return response.data.link_token;
  }
);

const ExchangePublicTokenInputSchema = z.object({ publicToken: z.string(), familyId: z.string(), userId: z.string() });
type ExchangePublicTokenInput = z.infer<typeof ExchangePublicTokenInputSchema>;

export const exchangePublicToken = defineFlow(
  'exchangePublicToken',
  { input: ExchangePublicTokenInputSchema, output: z.object({ success: z.boolean() }) },
  async ({ publicToken, familyId, userId }: ExchangePublicTokenInput) => {
    const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const { access_token: accessToken, item_id: itemId } = response.data;
    const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
    const institutionId = itemResponse.data.item.institution_id;
    const institutionName = institutionId ? (await plaidClient.institutionsGetById({ institution_id: institutionId, country_codes: [CountryCode.Us] })).data.institution.name : 'Unknown Institution';

    const plaidItemRef = doc(db, 'plaid_items', itemId);
    await setDoc(plaidItemRef, {
      id: itemId,
      familyId: familyId,
      userId: userId, // ユーザーIDを保存
      accessToken: accessToken,
      institutionName: institutionName,
      createdAt: serverTimestamp(),
    });

    void syncInvestments({ plaidItemId: itemId, familyId, userId });
    return { success: true };
  }
);

const SyncInvestmentsInputSchema = z.object({ plaidItemId: z.string(), familyId: z.string(), userId: z.string() });
type SyncInvestmentsInput = z.infer<typeof SyncInvestmentsInputSchema>;

export const syncInvestments = defineFlow(
  'syncInvestments',
  { input: SyncInvestmentsInputSchema, output: z.object({ success: z.boolean() }) },
  async ({ plaidItemId, familyId, userId }: SyncInvestmentsInput) => {
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
        batch.set(securityRef, { ...security, updatedAt: now }, { merge: true });
      }
      for (const account of accounts) {
        const accountRef = doc(db, 'investment_accounts', account.account_id);
        batch.set(accountRef, { ...account, familyId, plaidItemId, updatedAt: now });
      }
      for (const holding of holdings) {
        const holdingId = `${holding.account_id}-${holding.security_id}`;
        const holdingRef = doc(db, 'holdings', holdingId);
        batch.set(holdingRef, { ...holding, id: holdingId, familyId, userId, updatedAt: now });
      }
      await batch.commit();
      return { success: true };
  }
);

const SyncTransactionsInputSchema = z.object({ plaidItemId: z.string(), familyId: z.string(), userId: z.string() });
type SyncTransactionsInput = z.infer<typeof SyncTransactionsInputSchema>;

export const syncTransactions = defineFlow(
  'syncTransactions',
  { input: SyncTransactionsInputSchema, output: z.object({ success: z.boolean(), added: z.number() }) },
  async ({ plaidItemId, familyId, userId }: SyncTransactionsInput) => {
    const itemRef = doc(db, 'plaid_items', plaidItemId);
    const itemDoc = await getDoc(itemRef);
    if (!itemDoc.exists()) throw new Error(`Plaid item ${plaidItemId} not found.`);
    const { accessToken, transactionsCursor: lastCursor } = itemDoc.data();

    let cursor = lastCursor || null;
    let added: PlaidTransactionResponse[] = [];
    let hasMore = true;
    while (hasMore) {
      const response = await plaidClient.transactionsSync({ access_token: accessToken, cursor: cursor });
      added = added.concat(response.data.added);
      hasMore = response.data.has_more;
      cursor = response.data.next_cursor;
    }

    const txCollectionRef = collection(db, `families/${familyId}/transactions`).withConverter(txConverter);
    const batch = writeBatch(db);

    for (const plaidTx of added) {
      const txData: Omit<Transaction, 'id' | 'hash'> = {
        userId, // Add userId
        familyId,
        amount: plaidTx.amount * -1,
        originalAmount: plaidTx.amount,
        originalCurrency: plaidTx.iso_currency_code || 'USD',
        merchant: plaidTx.merchant_name || plaidTx.name,
        bookedAt: new Date(plaidTx.date),
        category: { major: 'other' },
        source: 'plaid',
        scope: 'personal',
        plaidTransactionId: plaidTx.transaction_id,
        plaidAccountId: plaidTx.account_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const hash = createTransactionHash({
        bookedAt: txData.bookedAt,
        merchant: txData.merchant,
        amount: txData.amount,
        originalCurrency: txData.originalCurrency,
      });
      const docRef = doc(txCollectionRef);
      batch.set(docRef, { ...txData, id: docRef.id, hash });
    }

    batch.update(itemRef, { transactionsCursor: cursor, updatedAt: serverTimestamp() });
    await batch.commit();
    return { success: true, added: added.length };
  }
);

const SyncAllTransactionsInputSchema = z.object({ familyId: z.string(), userId: z.string() });
type SyncAllTransactionsInput = z.infer<typeof SyncAllTransactionsInputSchema>;

export const syncAllTransactions = defineFlow(
    'syncAllTransactions',
    { input: SyncAllTransactionsInputSchema, output: z.object({ success: z.boolean(), syncedItems: z.number() }) },
    async ({ familyId, userId }: SyncAllTransactionsInput) => {
        const plaidItemsRef = collection(db, 'plaid_items');
        const q = query(plaidItemsRef, where("familyId", "==", familyId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return { success: true, syncedItems: 0 };
        const syncPromises = querySnapshot.docs.map(doc => syncTransactions({ plaidItemId: doc.id, familyId, userId }));
        await Promise.all(syncPromises);
        return { success: true, syncedItems: querySnapshot.size };
    }
);
