
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthDialog } from '@/components/finwise/auth-dialog';
import { useTranslations } from 'next-intl';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppContainer } from '@/components/finwise/app-container';

export default function Page() {
  const { user, loading } = useAuthState();
  const router = useRouter();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const t = useTranslations('AuthDialog');

  const handleSignIn = () => {
    // This will be handled by the auth state listener which will re-render
  }

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
      return (
          <>
            <main className="min-h-dvh bg-gradient-to-b from-[#0B1220] to-[#111827] text-white flex items-center justify-center">
              <div className="mx-auto max-w-4xl px-6 py-14 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">家計、話して、見える。</h1>
                <p className="mt-3 text-white/80">AIがあなたの支出を整理し、今日の一手を提案します。</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={() => setAuthDialogOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('signin')} / {t('signup')}
                  </Button>
                </div>
              </div>
            </main>
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onSignin={handleSignIn}/>
          </>
      )
  }

  return <AppContainer user={user} />;
}
