
'use server';

/**
 * @fileOverview A flow to suggest personalized monthly budget plans based on spending habits and financial goals, adjusted with the help of GenAI.
 *
 * - budgetPlanner - A function that handles the budget planning process.
 * - BudgetPlannerInput - The input type for the budgetPlanner function.
 * - BudgetPlannerOutput - The return type for the budgetPlanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CATEGORIES } from '@/data/dummy-data';

const BudgetPlannerInputSchema = z.object({
  transactions: z.array(z.any()).describe("The user's recent transactions."),
  goals: z.array(z.any()).describe("The user's financial goals."),
});
export type BudgetPlannerInput = z.infer<typeof BudgetPlannerInputSchema>;

const BudgetCategorySchema = z.object({
    key: z.string().describe("The category key."),
    limit: z.number().describe("The suggested budget limit for this category."),
});

const BudgetPlannerOutputSchema = z.object({
  suggestedBudget: z.array(BudgetCategorySchema).describe('A personalized monthly budget plan based on the user\'s spending habits and financial goals.'),
});
export type BudgetPlannerOutput = z.infer<typeof BudgetPlannerOutputSchema>;

export async function budgetPlanner(input: BudgetPlannerInput): Promise<BudgetPlannerOutput> {
  return budgetPlannerFlow(input);
}

const validCategories = CATEGORIES.map(c => c.key).join(', ');

const prompt = ai.definePrompt({
  name: 'budgetPlannerPrompt',
  input: {schema: BudgetPlannerInputSchema},
  output: {schema: BudgetPlannerOutputSchema},
  prompt: `あなたはパーソナルファイナンスのアドバイザーです。ユーザーの過去の取引と財務目標に基づき、パーソナライズされた月次予算計画を提案してください。

取引履歴:
\`\`\`json
{{{json transactions}}}
\`\`\`

財務目標:
\`\`\`json
{{{json goals}}}
\`\`\`

データを分析し、以下のカテゴリに新しい予算配分を提案してください: ${validCategories}。
結果は構造化されたJSONオブジェクトとして日本語で返してください。出力の 'key' は有効なカテゴリのいずれかでなければなりません。`,
});

const budgetPlannerFlow = ai.defineFlow(
  {
    name: 'budgetPlannerFlow',
    inputSchema: BudgetPlannerInputSchema,
    outputSchema: BudgetPlannerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
