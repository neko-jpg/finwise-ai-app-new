
'use client';

import { BudgetScreen } from '@/components/finwise/budget-screen';
import type { Budget, Transaction } from '@/domain';

interface BudgetPageProps {
  familyId?: string;
  personalBudget?: Budget | null;
  sharedBudget?: Budget | null;
  transactions?: Transaction[];
  setPersonalBudget?: React.Dispatch<React.SetStateAction<Budget | null>>;
  setSharedBudget?: React.Dispatch<React.SetStateAction<Budget | null>>;
  loading?: boolean;
}

export default function BudgetPage(props: BudgetPageProps) {
  return (
    <BudgetScreen {...props} />
  );
}
