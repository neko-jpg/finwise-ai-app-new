'use client';

import { TransactionsScreen } from '@/components/finwise/transactions-screen';
import { useTransactions } from '@/hooks/use-transactions';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
  const { transactions, loading } = useTransactions();

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return <TransactionsScreen transactions={transactions} />;
}
