'use client';

import {useTranslations} from 'next-intl';
import { AppContainer } from '@/components/finwise/app-container';
import { useAuthState } from '@/hooks/use-auth-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { AuthDialog } from '@/components/finwise/auth-dialog';
import { useState } from 'react';


export default function Page() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to a dedicated entry page, assuming it exists at /[locale]/entry
    router.push('/entry');
    return null; // or a loading spinner
  }

  return <AppContainer user={user} />;
}
