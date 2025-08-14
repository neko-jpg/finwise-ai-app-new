'use server';

/**
 * @fileOverview Analyzes user spending patterns and provides personalized insights.
 *
 * - analyzeSpending - A function that handles the spending analysis process.
 * - AnalyzeSpendingInput - The input type for the analyzeSpending function.
 * - AnalyzeSpendingOutput - The return type for the analyzeSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DEMO_TRANSACTIONS } from '@/data/dummy-data';

const AnalyzeSpendingInputSchema = z.object({});

export type AnalyzeSpendingInput = z.infer<typeof AnalyzeSpendingInputSchema>;

const AnalyzeSpendingOutputSchema = z.object({
  insights: z.string().describe('A concise, personalized insight based on spending patterns.'),
});

export type AnalyzeSpendingOutput = z.infer<typeof AnalyzeSpendingOutputSchema>;

export async function analyzeSpending(input: AnalyzeSpendingInput): Promise<AnalyzeSpendingOutput> {
  return analyzeSpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSpendingPrompt',
  input: {schema: z.object({
    transactions: z.any(),
  })},
  output: {schema: AnalyzeSpendingOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transactions and provide a short, personalized insight (under 150 characters) to help the user understand their financial habits.

  Transactions:
  \`\`\`json
  {{{json transactions}}}
  \`\`\`

  Insight:`,
});

const analyzeSpendingFlow = ai.defineFlow(
  {
    name: 'analyzeSpendingFlow',
    inputSchema: AnalyzeSpendingInputSchema,
    outputSchema: AnalyzeSpendingOutputSchema,
  },
  async () => {
    const {output} = await prompt({
        transactions: DEMO_TRANSACTIONS,
    });
    return output!;
  }
);
