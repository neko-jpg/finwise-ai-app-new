'use client';

import { FamilySettingsScreen } from '@/components/finwise/family-settings-screen';
import { Suspense } from 'react';

export default function FamilyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FamilySettingsScreen />
    </Suspense>
  );
}
