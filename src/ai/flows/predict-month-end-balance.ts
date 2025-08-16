'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Transaction } from '@/lib/types';
import { endOfMonth, getDaysInMonth, differenceInDays } from 'date-fns';

const PredictionInputSchema = z.object({
  transactions: z.array(z.any()).describe("A list of transactions from the current month so far."),
  currentBalance: z.number().describe("The user's current total balance across all accounts."),
});

const PredictionOutputSchema = z.object({
    prediction: z.string().describe("A friendly, natural language prediction of the user's month-end balance, in Japanese."),
});

const predictionPrompt = ai.definePrompt(
    {
        name: 'monthEndBalancePredictionPrompt',
        input: { schema: z.object({
            currentBalance: z.number(),
            projectedSpending: z.number(),
            avgDailySpending: z.number(),
        }) },
        output: { schema: PredictionOutputSchema },
        prompt: `あなたは、データを元に未来を予測するAIアシスタントです。以下の情報に基づき、ユーザーの月末の推定残高について、自然で分かりやすい日本語の文章を生成してください。

情報:
- 現在の合計残高: ¥{{{numberFormat currentBalance}}}
- 今月の予測支出合計: ¥{{{numberFormat projectedSpending}}}
- これまでの1日あたりの平均支出額: ¥{{{numberFormat avgDailySpending}}}

上記の情報を元に、以下のような形式で、ポジティブまたは中立的なトーンで予測を伝えてください。

例:
- 「このペースで支出を続けると、月末の残高は〇〇円になる見込みです。順調ですね！」
- 「現在のペースだと、月末には残高が約〇〇円になる予測です。この調子で支出を管理していきましょう。」

予測:`,
    },
    (input) => {
        // Add a custom helper to format numbers with commas for the prompt
        (global as any).numberFormat = (num: number) => Math.round(num).toLocaleString();
        return;
    }
);


export const predictMonthEndBalance = ai.defineFlow(
  {
    name: 'predictMonthEndBalance',
    inputSchema: PredictionInputSchema,
    outputSchema: PredictionOutputSchema,
  },
  async ({ transactions, currentBalance }) => {
    if (transactions.length === 0) {
        return { prediction: "今月の取引データがまだありません。支出を記録して、未来予測を始めましょう！" };
    }

    const today = new Date();
    const totalDaysInMonth = getDaysInMonth(today);
    const daysElapsed = today.getDate();
    const daysRemaining = totalDaysInMonth - daysElapsed;

    if (daysElapsed < 3) { // Not enough data to make a meaningful prediction
        return { prediction: "今月のデータがまだ少ないようです。数日後にまた確認してみてくださいね。" };
    }

    const totalSpending = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgDailySpending = totalSpending / daysElapsed;
    const projectedFutureSpending = avgDailySpending * daysRemaining;
    const projectedTotalSpending = totalSpending + projectedFutureSpending;

    try {
        const { output } = await predictionPrompt({
            currentBalance,
            projectedSpending: projectedTotalSpending,
            avgDailySpending
        });
        return output!;
    } catch (error) {
        console.error("Error generating month-end prediction:", error);
        throw new Error("AIによる未来予測の生成に失敗しました。");
    }
  }
);
