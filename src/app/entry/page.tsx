
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthDialog } from '@/components/finwise/auth-dialog';
import { useAuthState } from '@/hooks/use-auth-state';
import { Loader } from 'lucide-react';

export default function EntryPage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const router = useRouter();
  const { user, loading } = useAuthState();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/app');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
      if(!dialogOpen && !user) {
          router.push('/');
      }
  }, [dialogOpen, user, router]);


  if (loading || user) {
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
      <main className="marketing-body font-headline">
        <div className="flex h-screen w-screen items-center justify-center">
            <AuthDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen} 
                onSignin={() => router.replace('/app')}
            />
        </div>
      </main>
  );
}
