'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/finwise/auth-dialog';
export default function EntryPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // AuthProviderでloadingは処理済みなので、userの有無だけチェック
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // userがいない場合のみ、ログインダイアログを表示
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AuthDialog />
      </div>
    );
  }

  // userがいる場合（リダイレクト待ち）は何も表示しない
  return null;
}
