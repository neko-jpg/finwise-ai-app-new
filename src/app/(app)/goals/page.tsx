'use client';

import { GoalsScreen } from '@/components/finwise/goals-screen';
import { Suspense } from 'react';

export default function GoalsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoalsScreen />
    </Suspense>
  );
}
