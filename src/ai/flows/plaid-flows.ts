'use server';

import { defineFlow, run, startFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { PlaidApi, Configuration, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Plaid client configuration
// In a real application, these would be stored securely as environment variables.
// The PLAID_SANDBOX_SECRET key is being used for testing in the Sandbox environment.
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
 * This token is used by the frontend to initialize the Plaid Link UI.
 */
export const createLinkToken = defineFlow(
  {
    name: 'createLinkToken',
    inputSchema: CreateLinkTokenInputSchema,
    outputSchema: z.string(),
  },
  async ({ userId }) => {
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Finwise AI',
      products: [Products.Investments],
      country_codes: [CountryCode.Us], // Example: US only for now
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
 * Flow to exchange a public token for an access token.
 * The access token is stored securely and used for subsequent API calls.
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

      // We need the institution name for display purposes.
      // We can get it from the Item, but that requires another API call.
      // For now, let's assume we get it from the metadata in the Link onSuccess callback.
      // Or, we can make the call here. Let's do that.
      const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
      const institutionName = itemResponse.data.item.institution_id
        ? (await plaidClient.institutionsGetById({ institution_id: itemResponse.data.item.institution_id, country_codes: [CountryCode.Us] })).data.institution.name
        : 'Unknown Institution';

      // Save the access token and item ID to Firestore
      const plaidItemRef = doc(db, 'plaid_items', itemId);
      await setDoc(plaidItemRef, {
        familyId: familyId,
        accessToken: accessToken,
        institutionName: institutionName,
        createdAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error exchanging public token:", error);
      throw new Error("Failed to exchange public token.");
    }
  }
);
