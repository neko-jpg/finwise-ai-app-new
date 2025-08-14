'use server';

/**
 * @fileOverview Transaction categorization flow.
 *
 * - categorizeTransaction - A function that suggests a category for a transaction.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const CategorizeTransactionInputSchema = z.object({
  merchant: z.string().describe('The merchant name of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  note: z.string().optional().describe('An optional note about the transaction.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  major: z
    .string()
    .describe(
      'The suggested major category. Must be one of: food, daily, trans, fun, util, income, other'
    ),
  minor: z.string().optional().describe('The suggested minor category.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'The confidence score of the suggestion, from 0.0 (not confident) to 1.0 (very confident).'
    ),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
    return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: { schema: CategorizeTransactionInputSchema },
  output: { schema: CategorizeTransactionOutputSchema },
  prompt: `You are an expert accountant assistant for personal finance. Your task is to categorize a transaction based on the provided details.

Analyze the input (merchant name, amount, note) and determine the most appropriate category.
The major category MUST be one of the following: food, daily, trans, fun, util, income, other.
An income is represented by a positive amount.

Input:
- Merchant: {{{merchant}}}
- Amount: {{{amount}}}
{{#if note}}- Note: {{{note}}}{{/if}}

Output only the structured JSON object with the suggested category.`,
});


const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
