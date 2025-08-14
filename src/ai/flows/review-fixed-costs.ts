
'use server';

/**
 * @fileOverview A flow to review fixed costs and provide recommendations.
 *
 * - reviewFixedCosts - A function that handles the fixed cost review process.
 * - ReviewFixedCostsInput - The input type for the reviewFixedCosts function.
 * - ReviewFixedCostsOutput - The return type for the reviewFixedCosts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReviewFixedCostsInputSchema = z.object({
  transactions: z.array(z.any()).describe("The user's recent transactions over the last few months."),
});
export type ReviewFixedCostsInput = z.infer<typeof ReviewFixedCostsInputSchema>;

const CostChangeSchema = z.object({
    merchant: z.string().describe('The name of the service or utility provider.'),
    prev: z.number().describe('The previous month\'s cost.'),
    curr: z.number().describe('The current month\'s cost.'),
    deltaPct: z.number().describe('The percentage change from the previous month.'),
});

const ReviewFixedCostsOutputSchema = z.object({
  changes: z.array(CostChangeSchema).describe('A list of significant changes in fixed costs compared to the previous month.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations based on the analysis.'),
});
export type ReviewFixedCostsOutput = z.infer<typeof ReviewFixedCostsOutputSchema>;

export async function reviewFixedCosts(input: ReviewFixedCostsInput): Promise<ReviewFixedCostsOutput> {
  return reviewFixedCostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewFixedCostsPrompt',
  input: { schema: ReviewFixedCostsInputSchema },
  output: { schema: ReviewFixedCostsOutputSchema },
  prompt: `あなたはパーソナルファイナンスのアナリストです。以下の取引履歴を分析し、ユーザーの固定費（光熱費、家賃、通信費など）をレビューしてください。

取引履歴:
\`\`\`json
{{{json transactions}}}
\`\`\`

分析タスク:
1.  **固定費の変動を特定する**: 先月と今月を比較し、金額に大きな変動があった固定費をリストアップします。変動率（%）も計算してください。
2.  **推奨アクションを生成する**: 分析結果に基づき、ユーザーがコストを削減するために取れる具体的なアクションを2〜3個提案してください。（例：「電気料金が平均より高めです。電力会社の乗り換えシミュレーションをおすすめします。」）

結果を構造化されたJSONオブジェクトとして日本語で返してください。`,
});

const reviewFixedCostsFlow = ai.defineFlow(
  {
    name: 'reviewFixedCostsFlow',
    inputSchema: ReviewFixedCostsInputSchema,
    outputSchema: ReviewFixedCostsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
