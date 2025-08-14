
'use server';
/**
 * @fileOverview A flow to parse natural language speech into a structured transaction or a general query.
 *
 * - speechToTransaction - A function that handles the speech parsing process.
 * - SpeechToTransactionInput - The input type for the speechToTransaction function.
 * - SpeechToTransactionOutput - The return type for the speechToTransaction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpeechToTransactionInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
});
export type SpeechToTransactionInput = z.infer<typeof SpeechToTransactionInputSchema>;

const SpeechToTransactionOutputSchema = z.union([
  z.object({
    type: z.enum(['transaction']).describe('Indicates a transaction was parsed.'),
    amount: z.number().describe('The transaction amount. Expenditures should be negative.'),
    merchant: z.string().describe('The merchant or a description of the transaction.'),
  }),
  z.object({
    type: z.enum(['query']).describe('Indicates the input is a general query, not a transaction.'),
  }),
]);
export type SpeechToTransactionOutput = z.infer<typeof SpeechToTransactionOutputSchema>;

export async function speechToTransaction(input: SpeechToTransactionInput): Promise<SpeechToTransactionOutput> {
  return speechToTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speechToTransactionPrompt',
  input: { schema: SpeechToTransactionInputSchema },
  output: { schema: SpeechToTransactionOutputSchema },
  prompt: `ユーザーからの自然言語クエリを解析し、それが取引の記録なのか、一般的な質問なのかを判断してください。

- クエリが支出や収入の記録のように見える場合（例：「カフェで500円」「昨日、本を1500円で買った」「給料25万円」）、'transaction' タイプとして解析してください。支出は必ず負の数にしてください。
- クエリが質問、挨拶、またはその他の一般的な会話のように見える場合（例：「今日の支出は？」「こんにちは」）、'query' タイプとしてください。

今日のコンテキスト:
- 日付: 2025-08-13

ユーザーのクエリ: {{{query}}}

上記の指示に従って、構造化されたJSONオブジェクトとして日本語で出力してください。`,
});

const speechToTransactionFlow = ai.defineFlow(
  {
    name: 'speechToTransactionFlow',
    inputSchema: SpeechToTransactionInputSchema,
    outputSchema: SpeechToTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
