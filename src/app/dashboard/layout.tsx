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
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 読み込みが完了し、ユーザーが未認証であればエントリーページにリダイレクト
    if (!loading && !user) {
      router.push('/entry');
    }
  }, [user, loading, router]);

  // 読み込み中、またはユーザーがいない場合はローディング画面などを表示
  if (loading || !user) {
    return <div>Loading...</div>; // または適切なローディングコンポーネント
  }

  // ユーザーがいればダッシュボードの内容を表示
  return <AppContainer>{children}</AppContainer>;
}
