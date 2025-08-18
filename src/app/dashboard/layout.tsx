'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppContainer } from '@/components/finwise/app-container';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // AuthProviderでloadingは処理済みなので、ここではuserの有無だけチェックすればOK
    if (!user) {
      router.replace('/entry');
    }
  }, [user, router]);

  // user が存在する場合のみ、ページ内容を表示する
  if (user) {
    return <AppContainer>{children}</AppContainer>;
  }

  // user がいない場合（リダイレクト待ち）は何も表示しない
  return null;
}
