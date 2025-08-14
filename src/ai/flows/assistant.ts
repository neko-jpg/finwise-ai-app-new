'use server';

/**
 * @fileOverview A conversational assistant for financial queries.
 *
 * - assistant - A function that handles conversational queries about finances.
 * - AssistantInput - The input type for the assistant function.
 * - AssistantOutput - The return type for the assistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DEMO_TRANSACTIONS, INITIAL_BUDGET, DEMO_GOALS } from '@/data/dummy-data';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question about their finances.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s query.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function assistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: z.object({
      query: z.string(),
      transactions: z.any(),
      budget: z.any(),
      goals: z.any(),
  })},
  output: {schema: AssistantOutputSchema},
  prompt: `あなたはフレンドリーで有能なファイナンシャルアシスタントです。あなたの目標は、ユーザーの財務データに基づいて質問に答えることです。

ユーザーの財務データは以下の通りです:

**取引履歴 (今日は2025-08-13):**
\`\`\`json
{{{json transactions}}}
\`\`\`

**予算:**
\`\`\`json
{{{json budget}}}
\`\`\`

**目標:**
\`\`\`json
{{{json goals}}}
\`\`\`

現在の日付: 2025-08-13

上記のデータに基づき、以下のユーザーの質問に日本語で、簡潔かつ丁寧にお答えください。

ユーザーの質問: {{{query}}}
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt({
        ...input,
        transactions: DEMO_TRANSACTIONS,
        budget: INITIAL_BUDGET,
        goals: DEMO_GOALS,
    });
    return output!;
  }
);
