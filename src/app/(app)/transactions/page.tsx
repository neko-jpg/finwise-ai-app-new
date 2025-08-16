'use client';

import { TransactionsScreen } from '@/components/finwise/transactions-screen';
import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsScreen />
    </Suspense>
  );
}
