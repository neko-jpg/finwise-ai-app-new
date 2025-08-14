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
  prompt: `あなたはリアルタイムで節約のヒントを提供するパーソナルファイナンスアドバイザーです。現在の日付は2025-08-13です。

  ユーザーの最近の取引と予算の状況を分析し、潜在的な節約の機会を特定してください。具体的で実行可能な節約のヒント、その詳細な説明、および潜在的な節約額を日本語で提供してください。

  取引履歴 (今日は2025-08-13):
  \`\`\`json
  {{{json transactions}}}
  \`\`\`

  予算:
  \`\`\`json
  {{{json budget}}}
  \`\`\`

  提供されたデータに基づいて、現実的で達成しやすい節約のヒントを提案することに焦点を当ててください。ヒントは簡潔でインパクトのあるものにしてください。`,
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