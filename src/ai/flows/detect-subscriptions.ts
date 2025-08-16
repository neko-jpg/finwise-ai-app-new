'use server';

/**
 * @fileOverview A flow to detect recurring subscriptions from a list of transactions.
 *
 * - detectSubscriptions - A function that handles the subscription detection process.
 * - DetectSubscriptionsInput - The input type for the detectSubscriptions function.
 * - DetectSubscriptionsOutput - The return type for the detectSubscriptions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectSubscriptionsInputSchema = z.object({
  transactions: z.array(z.any()).describe("The user's recent transactions over the last few months."),
});
export type DetectSubscriptionsInput = z.infer<typeof DetectSubscriptionsInputSchema>;

const SubscriptionSchema = z.object({
  name: z.string().describe('The name of the service or merchant.'),
  amount: z.number().describe('The typical monthly amount of the subscription.'),
  interval: z.enum(['月次', '年次', 'その他']).describe('The payment interval.'),
  category: z.string().describe('The category of the subscription (e.g., "動画配信", "音楽", "クラウドストレージ", "ニュース", "仕事").'),
  wasteScore: z.number().min(0).max(1).describe('A score from 0 to 1 indicating how likely this subscription is to be wasteful, based on usage patterns or redundancy. 1.0 means very likely wasteful.'),
  nextDate: z.string().describe('The estimated next payment date in YYYY-MM-DD format.'),
  suggestion: z.string().describe('A concrete, actionable suggestion for the user if there is potential for optimization. E.g., "Consider switching to an annual plan to save money." or "You have multiple video streaming services." If no specific suggestion, provide a general summary.'),
  transactionIds: z.array(z.string()).describe('An array of transaction IDs that belong to this subscription.'),
});

const DetectSubscriptionsOutputSchema = z.object({
  subscriptions: z.array(SubscriptionSchema).describe('A list of detected subscriptions.'),
});
export type DetectSubscriptionsOutput = z.infer<typeof DetectSubscriptionsOutputSchema>;

export async function detectSubscriptions(input: DetectSubscriptionsInput): Promise<DetectSubscriptionsOutput> {
  return detectSubscriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSubscriptionsPrompt',
  input: { schema: DetectSubscriptionsInputSchema },
  output: { schema: DetectSubscriptionsOutputSchema },
  prompt: "test",
});

const detectSubscriptionsFlow = ai.defineFlow(
  {
    name: 'detectSubscriptionsFlow',
    inputSchema: DetectSubscriptionsInputSchema,
    outputSchema: DetectSubscriptionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
