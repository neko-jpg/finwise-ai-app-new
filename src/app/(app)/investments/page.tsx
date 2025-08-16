'use client';

import { InvestmentsScreen } from '@/components/finwise/investments-screen';
import type { Account } from '@/domain';
import type { User } from 'firebase/auth';

interface InvestmentsPageProps {
  user?: User;
  familyId?: string;
  accounts: Account[];
  loading?: boolean;
}

export default function InvestmentsPage(props: InvestmentsPageProps) {
  return (
    <InvestmentsScreen {...props} />
  );
}
