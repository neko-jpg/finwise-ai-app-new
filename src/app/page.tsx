
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { Loader } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/app');
      } else {
        router.replace('/marketing');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background dark">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
