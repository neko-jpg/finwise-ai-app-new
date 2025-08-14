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

const AnalyzeSpendingInputSchema = z.object({
    transactions: z.array(z.any()).describe("The user's recent transactions.")
});

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
  input: {schema: AnalyzeSpendingInputSchema},
  output: {schema: AnalyzeSpendingOutputSchema},
  prompt: `あなたはパーソナルファイナンスアドバイザーです。以下の取引を分析し、ユーザーが自身の財務習慣を理解するのに役立つ、短くパーソナライズされたインサイト（150文字未満）を日本語で提供してください。

  取引履歴:
  \`\`\`json
  {{{json transactions}}}
  \`\`\`

  インサイト:`,
});

const analyzeSpendingFlow = ai.defineFlow(
  {
    name: 'analyzeSpendingFlow',
    inputSchema: AnalyzeSpendingInputSchema,
    outputSchema: AnalyzeSpendingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
