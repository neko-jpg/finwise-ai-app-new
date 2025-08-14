'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { AppContainer } from '@/components/finwise/app-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  const { user, loading } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const locale = pathname.split('/')[1] || 'ja';
      router.push(`/${locale}/entry`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
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

  return <AppContainer user={user} />;
}
