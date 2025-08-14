
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

const CategorizeTransactionInputSchema = z.object({
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

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'categorizeTransactionPrompt',
      input: { schema: CategorizeTransactionInputSchema },
      output: { schema: CategorizeTransactionOutputSchema },
      prompt: `あなたは個人の財務管理を専門とする会計アシスタントです。あなたのタスクは、提供された詳細情報に基づいて取引を分類することです。

入力（店名、金額、メモ）を分析し、最も適切なカテゴリを判断してください。
主要カテゴリは必ず以下のいずれかである必要があります: food, daily, trans, fun, util, income, other。
収入は正の金額で表されます。

入力:
- 店名: {{{merchant}}}
- 金額: {{{amount}}}
{{#if note}}- メモ: {{{note}}}{{/if}}

出力は、提案されたカテゴリを含む構造化されたJSONオブジェクトのみとしてください。`,
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);
