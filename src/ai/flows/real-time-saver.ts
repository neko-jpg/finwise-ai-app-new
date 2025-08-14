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
import { DEMO_TRANSACTIONS, INITIAL_BUDGET } from '@/data/dummy-data';

const RealTimeSaverInputSchema = z.object({});
export type RealTimeSaverInput = z.infer<typeof RealTimeSaverInputSchema>;

const RealTimeSaverOutputSchema = z.object({
  savingTip: z.string().describe('A personalized saving tip based on the user\'s spending data.'),
  explanation: z.string().describe('A detailed explanation of why this tip is being suggested, based on recent spending patterns and budget progress.'),
  potentialSavings: z.number().describe('The potential savings amount if the tip is followed.'),
});
export type RealTimeSaverOutput = z.infer<typeof RealTimeSaverOutputSchema>;

export async function realTimeSaver(input: RealTimeSaverInput): Promise<RealTimeSaverOutput> {
  return realTimeSaverFlow(input);
}

const realTimeSaverPrompt = ai.definePrompt({
  name: 'realTimeSaverPrompt',
  input: {schema: z.object({
    transactions: z.any(),
    budget: z.any(),
  })},
  output: {schema: RealTimeSaverOutputSchema},
  prompt: `You are a personal finance advisor providing real-time saving tips. The current date is 2025-08-13.

  Analyze the user's recent transactions and budget status to identify a potential savings opportunity. Provide a specific and actionable saving tip, a detailed explanation for it, and the potential savings amount.

  Transactions (today is 2025-08-13):
  \`\`\`json
  {{{json transactions}}}
  \`\`\`

  Budget:
  \`\`\`json
  {{{json budget}}}
  \`\`\`

  Focus on suggesting realistic and easily achievable saving tips based on the provided data. The tip should be concise and impactful.`,
});

const realTimeSaverFlow = ai.defineFlow(
  {
    name: 'realTimeSaverFlow',
    inputSchema: RealTimeSaverInputSchema,
    outputSchema: RealTimeSaverOutputSchema,
  },
  async () => {
    const {output} = await realTimeSaverPrompt({
        transactions: DEMO_TRANSACTIONS,
        budget: INITIAL_BUDGET,
    });
    return output!;
  }
);
