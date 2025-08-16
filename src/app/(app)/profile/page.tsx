'use client';

import { ProfileScreen } from '@/components/finwise/profile-screen';
import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileScreen />
    </Suspense>
  );
}
