
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, LogIn, LogOut, Upload, Loader } from "lucide-react";
import type { User } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { signOut, linkToGoogle } from "@/lib/auth";
import { useState, useRef, ChangeEvent } from "react";
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { format, parse } from 'date-fns';

interface ProfileScreenProps {
  user?: User;
  offline?: boolean;
  setOffline?: (v: boolean) => void;
}

export function ProfileScreen({ user, offline, setOffline = () => {} }: ProfileScreenProps) {
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!user) {
      return null;
  }
  
  const handleLink = async () => {
    setIsLinking(true);
    try {
      await linkToGoogle();
      toast({
        title: "アカウントを連携しました",
        description: "Googleアカウントでログインできるようになりました。",
      });
    } catch(e: any) {
      console.error(e);
      let description = "時間をおいて再度お試しください。"
      if (e.code === 'auth/popup-blocked') {
        description = "ポップアップがブロックされました。ブラウザの設定でポップアップを許可してから、再度お試しください。"
      } else if (e.code === 'auth/credential-already-in-use') {
        description = "このGoogleアカウントは既に使用されています。別のアカウントで試すか、一度ログアウトしてから再度ログインしてください。"
      }
      toast({
        title: "連携に失敗しました",
        description,
        variant: "destructive"
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        // Basic CSV parsing. Assumes format: Date (YYYY/M/D), Merchant, Amount
        const lines = text.split('\n').slice(1); // Skip header
        let importedCount = 0;
        const SHA256 = require('crypto-js/sha256');

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const [dateStr, merchant, amountStr] = line.split(',');
                const amount = parseFloat(amountStr);
                if (!dateStr || !merchant || isNaN(amount)) {
                    console.warn("Skipping invalid line:", line);
                    continue;
                }
                const bookedAt = parse(dateStr, 'yyyy/M/d', new Date());

                const hashSource = user.uid + format(bookedAt, 'yyyyMMdd') + amount + merchant;
                const docData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
                    bookedAt,
                    amount,
                    currency: 'JPY',
                    merchant: merchant.trim(),
                    category: { major: 'other' }, // Default category, user can re-categorize
                    source: 'csv',
                    hash: SHA256(hashSource).toString(),
                    clientUpdatedAt: new Date(),
                };

                await addDoc(collection(db, `users/${user.uid}/transactions`), {
                    ...docData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                importedCount++;

            } catch (err) {
                console.error("Failed to import line:", line, err);
            }
        }
        
        toast({
            title: "インポート完了",
            description: `${importedCount}件の取引をインポートしました。`,
        });
        setIsImporting(false);
    };
    reader.readAsText(file, 'sjis'); // Shift_JIS a.k.a. SJIS
    // Reset file input to allow re-uploading the same file
    event.target.value = '';
  };
  
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
                <Button onClick={handleLink} disabled={isLinking}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLinking ? '連携中...' : 'Googleアカウントと連携'}
                </Button>
            ) : (
                <Button variant="destructive" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </Button>
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
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            <Button variant="secondary" onClick={handleImportClick} disabled={isImporting}>
                {isImporting ? <Loader className="animate-spin mr-2"/> : <Upload className="mr-2"/>}
                CSVをインポート
            </Button>
          <Button variant="outline">データをエクスポート</Button>
          <Button variant="destructive">全データを削除</Button>
        </CardContent>
      </Card>
    </div>
  );
}
