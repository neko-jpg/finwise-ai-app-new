'use server';

import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';

const ExchangeRateInputSchema = z.object({
  base: z.string().length(3).describe("The base currency code (e.g., 'USD')"),
  target: z.string().length(3).describe("The target currency code (e.g., 'JPY')"),
});

/**
 * Flow to get the exchange rate between two currencies.
 * Uses the exchangerate.host API.
 */
export const getExchangeRate = defineFlow(
  {
    name: 'getExchangeRate',
    inputSchema: ExchangeRateInputSchema,
    outputSchema: z.number(),
  },
  async ({ base, target }) => {
    // In a real application, this API key would be stored securely as an environment variable.
    const apiKey = process.env.EXCHANGERATE_API_KEY || 'YOUR_API_KEY_HERE';
    const url = `https://api.exchangerate.host/live?access_key=${apiKey}&source=${base}&currencies=${target}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Exchange rate API error: ${data.error?.info || 'Unknown error'}`);
      }

      const quoteKey = `${base}${target}`;
      const rate = data.quotes?.[quoteKey];

      if (typeof rate !== 'number') {
        throw new Error(`Rate for ${quoteKey} not found in API response.`);
      }

      return rate;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // In a real app, you might have a fallback or default rate.
      // For now, we'll throw an error to make it clear something went wrong.
      throw new Error("Failed to fetch exchange rate.");
    }
  }
);
