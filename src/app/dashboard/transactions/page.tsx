'use client';

import { TransactionsScreen } from '@/components/finwise/transactions-screen';
import { useTransactions } from '@/hooks/use-transactions';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
  // ページコンポーネントでデータと更新用の関数をすべて取得します
  const {
    transactions,
    loading,
    updateTransaction,
    deleteTransaction,
    createTransaction,
  } = useTransactions();

  // データの読み込み中は、ローディング画面を表示します
  if (loading) {
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

  // 読み込み完了後、取得したデータと関数をすべて表示用コンポーネントに渡します
  return (
    <TransactionsScreen
      transactions={transactions}
      updateTransaction={updateTransaction}
      deleteTransaction={deleteTransaction}
      createTransaction={createTransaction}
    />
  );
}
