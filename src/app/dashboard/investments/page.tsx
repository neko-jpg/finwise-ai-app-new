'use client';

import { InvestmentsScreen } from '@/components/finwise/investments-screen';
import { Suspense } from 'react';

export default function InvestmentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvestmentsScreen />
    </Suspense>
  );
}
