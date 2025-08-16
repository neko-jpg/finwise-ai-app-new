'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Transaction } from '@/lib/types';

const WeeklySummaryInputSchema = z.object({
  transactions: z.array(z.any()).describe("A list of transactions from the past week."),
});

const WeeklySummaryOutputSchema = z.object({
    mvpCategory: z.string().describe("The 'MVP' category where the user spent the least amount of money this week. This should be a category label, e.g., '食費'."),
    highestSpendingCategory: z.string().describe("The category where the user spent the most money this week. This should be a category label, e.g., '趣味'."),
    subscriptionToWatch: z.string().nullable().describe("A recurring subscription payment that the user should be aware of from this week's transactions, or null if none stands out."),
    positiveInsight: z.string().describe("A short, positive, and encouraging insight about the user's spending this week, in Japanese."),
});

const summaryPrompt = ai.definePrompt(
    {
        name: 'generateWeeklySummaryPrompt',
        input: { schema: WeeklySummaryInputSchema },
        output: { schema: WeeklySummaryOutputSchema },
        prompt: `あなたはユーザーを励ますのが得意な、ポジティブなファイナンシャル・コーチです。以下の1週間の取引履歴を分析し、週次レポートのサマリーを生成してください。

取引履歴:
\`\`\`json
{{{json transactions}}}
\`\`\`

分析タスク:
1.  **MVPカテゴリの特定:** この1週間で、支出が最も少なかったカテゴリを見つけてください。これを「今週のMVP」とします。(カテゴリ名を返してください)
2.  **最大支出カテゴリの特定:** この1週間で、支出が最も多かったカテゴリを特定してください。(カテゴリ名を返してください)
3.  **要注意サブスクの特定:** 取引の中から、注意を払うべき定期的な支払い（サブスクリプション）を一つ見つけてください。なければnullを返してください。(サービス名を返してください)
4.  **ポジティブなインサイトの生成:** 全体的な支出傾向を褒めたり、励ましたりするような、短くポジティブなコメントを生成してください。

結果は必ず指定されたJSON形式で、日本語で返してください。`,
    }
);


export const generateWeeklySummary = ai.defineFlow(
  {
    name: 'generateWeeklySummary',
    inputSchema: WeeklySummaryInputSchema,
    outputSchema: WeeklySummaryOutputSchema,
  },
  async ({ transactions }) => {
    if (transactions.length === 0) {
        throw new Error("No transactions provided for weekly summary.");
    }

    try {
        const { output } = await summaryPrompt({ transactions });
        return output!;
    } catch (error) {
        console.error("Error generating weekly summary:", error);
        throw new Error("AIによる週次サマリーの生成に失敗しました。");
    }
  }
);
