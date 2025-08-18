'use client';

import { BudgetScreen } from '@/components/finwise/budget-screen';
import { useAppData } from '@/contexts/app-data-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetPage() {
  const {
    loading,
    personalBudget,
    sharedBudget,
    setPersonalBudget,
    setSharedBudget,
    transactions,
  } = useAppData();

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <BudgetScreen
      personalBudget={personalBudget}
      sharedBudget={sharedBudget}
      setPersonalBudget={setPersonalBudget}
      setSharedBudget={setSharedBudget}
      transactions={transactions}
    />
  );
}
