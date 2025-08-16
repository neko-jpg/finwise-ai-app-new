
'use client';

import { TransactionsScreen } from '@/components/finwise/transactions-screen';
import type { Transaction } from '@/domain';

import React from 'react';

interface TransactionsPageProps {
  transactions: Transaction[];
  loading?: boolean;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export default function TransactionsPage(props: TransactionsPageProps) {
  return (
    <TransactionsScreen {...props} />
  );
}
