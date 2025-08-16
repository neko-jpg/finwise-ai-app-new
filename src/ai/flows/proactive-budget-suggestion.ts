'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Budget, Transaction } from '@/lib/types';
import { CATEGORIES } from '@/data/dummy-data';

const SuggestionInputSchema = z.object({
  budget: z.any().describe("The user's budget object, containing limits and used amounts per category."),
  transactions: z.array(z.any()).describe("A list of recent transactions."),
});

const SuggestionOutputSchema = z.object({
    suggestion: z.string().nullable().describe("A helpful, non-judgmental suggestion in Japanese, or null if no suggestion is warranted."),
});

const suggestionPrompt = ai.definePrompt(
    {
        name: 'proactiveBudgetSuggestionPrompt',
        input: { schema: z.object({ categoryLabel: z.string(), usageRate: z.number(), totalSpent: z.number() }) },
        output: { schema: z.object({ suggestion: z.string() }) },
        prompt: `あなたは親切で賢いファイナンシャル・アドバイザーです。ユーザーの支出が予算の上限に近づいていることを優しく伝え、具体的な改善案を提案してください。

状況:
- カテゴリ: {{{categoryLabel}}}
- 予算使用率: {{{usageRate}}}%
- このカテゴリでの今月の支出額: ¥{{{totalSpent}}}

上記の状況に基づき、ユーザーが次にとるべきアクションを促す、ポジティブで具体的な提案を1つだけ、150文字以内の短い日本語で生成してください。

例:
- 「食費が予算の80%に達しました。今週は外食を少し控えて、自炊を楽しんでみませんか？」
- 「趣味への出費がいいペースですね！月末まで予算内で楽しめるよう、大きな買い物は少し計画的に進めると安心です。」

提案:`,
    }
);


export const proactiveBudgetSuggestion = ai.defineFlow(
  {
    name: 'proactiveBudgetSuggestion',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema,
  },
  async ({ budget }) => {
    if (!budget || !budget.limits || !budget.used) {
        return { suggestion: null };
    }

    const SUGGESTION_THRESHOLD = 0.8; // 80%

    // Find the first category that has exceeded the threshold
    const overspentCategoryKey = Object.keys(budget.limits).find(key => {
        const limit = budget.limits[key];
        const used = budget.used[key] || 0;
        return limit > 0 && (used / limit) > SUGGESTION_THRESHOLD;
    });

    if (!overspentCategoryKey) {
        return { suggestion: null };
    }

    const categoryLabel = CATEGORIES.find(c => c.key === overspentCategoryKey)?.label || overspentCategoryKey;
    const limit = budget.limits[overspentCategoryKey];
    const used = budget.used[overspentCategoryKey];
    const usageRate = Math.round((used / limit) * 100);

    // Call the AI prompt to generate a creative suggestion
    try {
        const { output } = await suggestionPrompt({
            categoryLabel,
            usageRate,
            totalSpent: used
        });
        return { suggestion: output?.suggestion || null };
    } catch (error) {
        console.error("Error generating proactive suggestion:", error);
        // Don't bother the user with an error, just return no suggestion.
        return { suggestion: null };
    }
  }
);
