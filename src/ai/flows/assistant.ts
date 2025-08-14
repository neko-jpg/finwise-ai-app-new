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
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are a friendly and helpful financial assistant. Your goal is to answer the user's questions based on their financial data.

Here is the user's financial data:

**Transactions (today is 2025-08-13):**
\`\`\`json
{{{json transactions}}}
\`\`\`

**Budget:**
\`\`\`json
{{{json budget}}}
\`\`\`

**Goals:**
\`\`\`json
{{{json goals}}}
\`\`\`

Current Date: 2025-08-13

Based on the data above, please answer the following user question. Be concise and helpful.

User Question: {{{query}}}
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
