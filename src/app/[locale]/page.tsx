
'use client';

import { useAuthState } from '../hooks/use-auth-state';
import { AppContainer } from '@/components/finwise/app-container';
import EntryPage from './entry/page';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuthState();

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
    return <EntryPage />;
  }

  return <AppContainer user={user} />;
}
