// budget-planner.ts
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

const BudgetPlannerInputSchema = z.object({
  spendingHabits: z.string().describe('A description of the user\'s spending habits.'),
  financialGoals: z.string().describe('A description of the user\'s financial goals.'),
  currentBudget: z.string().optional().describe('The user\'s current budget, if any.'),
});
export type BudgetPlannerInput = z.infer<typeof BudgetPlannerInputSchema>;

const BudgetPlannerOutputSchema = z.object({
  suggestedBudget: z.string().describe('A personalized monthly budget plan based on the user\'s spending habits and financial goals.'),
});
export type BudgetPlannerOutput = z.infer<typeof BudgetPlannerOutputSchema>;

export async function budgetPlanner(input: BudgetPlannerInput): Promise<BudgetPlannerOutput> {
  return budgetPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetPlannerPrompt',
  input: {schema: BudgetPlannerInputSchema},
  output: {schema: BudgetPlannerOutputSchema},
  prompt: `You are a personal finance advisor. Based on the user's spending habits and financial goals, suggest a personalized monthly budget plan.

Spending Habits: {{{spendingHabits}}}
Financial Goals: {{{financialGoals}}}
Current Budget: {{{currentBudget}}}

Suggested Budget Plan:`,    
});

const budgetPlannerFlow = ai.defineFlow(
  {
    name: 'budgetPlannerFlow',
    inputSchema: BudgetPlannerInputSchema,
    outputSchema: BudgetPlannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
