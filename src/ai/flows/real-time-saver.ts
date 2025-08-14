'use server';

/**
 * @fileOverview Real-time saving tips flow.
 *
 * - realTimeSaver - A function that provides real-time saving tips based on user spending.
 * - RealTimeSaverInput - The input type for the realTimeSaver function.
 * - RealTimeSaverOutput - The return type for the realTimeSaver function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeSaverInputSchema = z.object({
  spendingData: z.string().describe('A JSON string containing the user\'s recent spending data, including categories and amounts.'),
  currentBalance: z.number().describe('The user\'s current account balance.'),
  monthlyBudget: z.number().describe('The user\'s monthly budget.'),
});
export type RealTimeSaverInput = z.infer<typeof RealTimeSaverInputSchema>;

const RealTimeSaverOutputSchema = z.object({
  savingTip: z.string().describe('A personalized saving tip based on the user\'s spending data.'),
  tipCategory: z.string().describe('The category the saving tip belongs to (e.g., food, transportation).'),
  potentialSavings: z.number().describe('The potential savings amount if the tip is followed.'),
});
export type RealTimeSaverOutput = z.infer<typeof RealTimeSaverOutputSchema>;

export async function realTimeSaver(input: RealTimeSaverInput): Promise<RealTimeSaverOutput> {
  return realTimeSaverFlow(input);
}

const realTimeSaverPrompt = ai.definePrompt({
  name: 'realTimeSaverPrompt',
  input: {schema: RealTimeSaverInputSchema},
  output: {schema: RealTimeSaverOutputSchema},
  prompt: `You are a personal finance advisor providing real-time saving tips.

  Analyze the user's spending data to identify potential savings opportunities. Provide a specific and actionable saving tip, the category it belongs to, and the potential savings amount.

  Spending Data: {{{spendingData}}}
  Current Balance: {{{currentBalance}}}
  Monthly Budget: {{{monthlyBudget}}}

  Focus on suggesting realistic and easily achievable saving tips based on the provided data.`,
});

const realTimeSaverFlow = ai.defineFlow(
  {
    name: 'realTimeSaverFlow',
    inputSchema: RealTimeSaverInputSchema,
    outputSchema: RealTimeSaverOutputSchema,
  },
  async input => {
    const {output} = await realTimeSaverPrompt(input);
    return output!;
  }
);
