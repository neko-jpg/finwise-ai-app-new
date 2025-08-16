'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from '@/hooks/use-user-profile';
import { signOut } from '@/lib/auth';
import { useAuthState } from '@/hooks/use-auth-state';
import { useRouter } from 'next/navigation';
import { TwoFactorAuthSetupDialog } from './two-factor-auth-setup-dialog';
import { format } from 'date-fns';

interface ProfileScreenProps {}

export function ProfileScreen({}: ProfileScreenProps) {
  const router = useRouter();
  const { user } = useAuthState();
  const { userProfile, loading } = useUserProfile(user?.uid);
  const [is2faDialogOpen, setIs2faDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/entry');
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!userProfile) {
    return <div>プロフィールが見つかりません。</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.photoURL ?? ''} alt={userProfile.displayName ?? 'User'} />
              <AvatarFallback>{userProfile.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{userProfile.displayName}</CardTitle>
              <CardDescription>{userProfile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">メンバー登録日: {format(userProfile.createdAt, 'yyyy年MM月dd日')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>設定</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <p>2段階認証</p>
                <Button variant="outline" onClick={() => setIs2faDialogOpen(true)}>設定</Button>
            </div>
             <div className="flex items-center justify-between">
                <p>家族の管理</p>
                <Button variant="outline" onClick={() => router.push('/app/family')}>移動</Button>
            </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader><CardTitle>データ管理</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <p>取引データのエクスポート</p>
                <Button variant="outline">CSVエクスポート</Button>
            </div>
        </CardContent>
      </Card>


      <Button variant="destructive" onClick={handleSignOut} className="w-full">
        ログアウト
      </Button>

      <TwoFactorAuthSetupDialog open={is2faDialogOpen} onOpenChange={setIs2faDialogOpen} />
    </div>
  );
}
