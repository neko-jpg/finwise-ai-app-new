'use client';

import { TransactionsScreen } from '@/components/finwise/transactions-screen';
import { useAppData } from '@/contexts/app-data-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
  const {
    loading,
    transactions,
    familyId,
    user,
    rules,
    primaryCurrency,
    updateTransaction,
    deleteTransaction,
    createTransaction,
  } = useAppData();

  if (loading || !familyId || !user) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <TransactionsScreen
      transactions={transactions}
      familyId={familyId}
      user={user}
      rules={rules}
      primaryCurrency={primaryCurrency}
      updateTransaction={updateTransaction}
      deleteTransaction={deleteTransaction}
      createTransaction={createTransaction}
    />
  );
}
