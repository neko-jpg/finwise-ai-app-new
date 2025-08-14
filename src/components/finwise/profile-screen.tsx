import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";
import type { User } from 'firebase/auth';

interface ProfileScreenProps {
  offline: boolean;
  setOffline: (v: boolean) => void;
  user: User;
}

export function ProfileScreen({ offline, setOffline, user }: ProfileScreenProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
          <h2 className="text-2xl font-bold font-headline">設定</h2>
          <p className="text-muted-foreground">アカウントとアプリの管理</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>アカウント</CardTitle>
            <CardDescription>
                {user.isAnonymous ? "現在匿名で利用中です。データを引き継ぐにはログインしてください。" : `ログイン中: ${user.email || 'メールアドレス未設定'}`}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {user.isAnonymous ? (
                <Button>Googleアカウントでログイン</Button>
            ) : (
                <Button variant="destructive">ログアウト</Button>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">PWA設定</CardTitle>
          <CardDescription>オフラインアクセスと通知</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div>
              <label htmlFor="offline-switch" className="font-medium block cursor-pointer">オフラインモード（擬似）</label>
              <p className="text-sm text-muted-foreground">PWAのキャッシュ表示をテストします</p>
            </div>
            <Switch id="offline-switch" checked={offline} onCheckedChange={setOffline} aria-label="Toggle offline mode" />
          </div>
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div>
              <div className="font-medium">ホーム画面に追加</div>
              <p className="text-sm text-muted-foreground">PWAとしてインストールします</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Show install instructions"><ChevronRight className="h-4 w-4" /></Button>
          </div>
           <div className="flex items-center justify-between py-4 first:pt-0">
            <div>
              <label htmlFor="notif-switch" className="font-medium block cursor-pointer">プッシュ通知</label>
              <p className="text-sm text-muted-foreground">予算超過アラートなどを受け取る</p>
            </div>
            <Switch id="notif-switch" aria-label="Toggle push notifications"/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">データ管理</CardTitle>
          <CardDescription>取引データのインポート・エクスポート</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="secondary">CSVをインポート</Button>
          <Button variant="outline">データをエクスポート</Button>
          <Button variant="destructive">全データを削除</Button>
        </CardContent>
      </Card>
    </div>
  );
}
