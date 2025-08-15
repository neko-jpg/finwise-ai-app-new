'use server';

/**
 * @fileOverview Finds potential duplicate transactions from a given list.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// To keep the prompt clean, we only pass the relevant fields to the AI.
const TransactionForDuplicateDetectionSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  amount: z.number(),
  bookedAt: z.string().describe('The date of the transaction in ISO 8601 format.'),
});

const DetectDuplicatesInputSchema = z.object({
  transactions: z.array(TransactionForDuplicateDetectionSchema),
});

export type DetectDuplicatesInput = z.infer<typeof DetectDuplicatesInputSchema>;

const DetectDuplicatesOutputSchema = z.object({
  potentialDuplicates: z.array(
    z.object({
      tx1_id: z.string().describe('The ID of the first transaction in the duplicate pair.'),
      tx2_id: z.string().describe('The ID of the second transaction in the duplicate pair.'),
      reason: z.string().describe('A brief explanation of why these transactions are considered potential duplicates.'),
    })
  ).describe('An array of potential duplicate transaction pairs. This should be empty if no duplicates are found.'),
});

export type DetectDuplicatesOutput = z.infer<typeof DetectDuplicatesOutputSchema>;

export async function detectDuplicates(input: DetectDuplicatesInput): Promise<DetectDuplicatesOutput> {
  // In a real app, you might add more logic here, e.g., filtering out transactions that have already been checked.
  return detectDuplicatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDuplicatesPrompt',
  input: { schema: DetectDuplicatesInputSchema },
  output: { schema: DetectDuplicatesOutputSchema },
  prompt: `あなたは、細心の注意を払う会計士です。提供された取引リストを分析し、重複している可能性のある取引のペアを特定してください。

考慮すべき点:
- 金額が完全に、またはほぼ同じ取引に注意してください。
- 取引日が数日以内であるペアを探してください。
- 店舗名が類似している、または関連しているペアを考慮してください（例：「Amazon」「AMZN Mktp」「アマゾン」）。
- ECサイトでの購入記録とその後のクレジットカード請求など、異なるソースからの取引が同じイベントを指している一般的なケースを特定してください。
- 既に重複として特定したペアを再度リストしないでください。各ペアは一度だけ報告してください。

取引履歴:
\`\`\`json
{{{json transactions}}}
\`\`\`

重複の可能性があるペアを、指定されたJSON形式で返してください。重複が見つからない場合は、空の配列を返してください。`,
});

const detectDuplicatesFlow = ai.defineFlow(
  {
    name: 'detectDuplicatesFlow',
    inputSchema: DetectDuplicatesInputSchema,
    outputSchema: DetectDuplicatesOutputSchema,
  },
  async (input) => {
    // Filter out transactions that are too far apart in time to be duplicates to reduce token usage.
    // This is a simple heuristic; a more advanced version could be more sophisticated.
    const recentTransactions = input.transactions.filter(tx => {
        const txDate = new Date(tx.bookedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return txDate > thirtyDaysAgo;
    });

    if (recentTransactions.length < 2) {
        return { potentialDuplicates: [] };
    }

    const { output } = await prompt({ transactions: recentTransactions });
    return output!;
  }
);
