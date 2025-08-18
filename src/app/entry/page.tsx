'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/finwise/auth-dialog';

export default function EntryPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ユーザー情報が確定し、ログイン済みであればダッシュボードにリダイレクト
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // ユーザーがダイアログを閉じようとしても、何もしないことで無効化する関数
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      return;
    }
  };

  // サインイン成功時の処理（リダイレクトはuseEffectが担当するので空でOK）
  const handleSignin = () => {
    // The redirect is handled by the useEffect watching the `user` object.
  };

  // ユーザーがいない場合（未ログイン）のみ、ログインダイアログを表示
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AuthDialog
          open={true} // 常にダイアログを開いた状態にする
          onOpenChange={handleOpenChange} // ユーザーが閉じられないようにする
          onSignin={handleSignin} // 必要なpropを渡す
        />
      </div>
    );
  }

  // ユーザーがいる場合（リダイレクト待ち）は何も表示しない
  return null;
}
