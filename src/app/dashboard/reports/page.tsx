'use client';

import { ReportsScreen } from '@/components/finwise/reports-screen';
import { Suspense } from 'react';

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsScreen />
    </Suspense>
  );
}
