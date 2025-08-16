'use client';

import { ReportsScreen } from '@/components/finwise/reports-screen';
import type { Transaction, Account } from '@/domain';

interface ReportsPageProps {
  transactions: Transaction[];
  accounts: Account[];
}

export default function ReportsPage(props: ReportsPageProps) {
  return (
    <ReportsScreen {...props} />
  );
}
