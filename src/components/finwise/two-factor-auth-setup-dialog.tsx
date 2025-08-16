'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Skeleton } from '@/components/ui/skeleton';

const functions = getFunctions();
const generate2faSecretFn = httpsCallable(functions, 'generate2faSecret');
const verifyAndEnable2faFn = httpsCallable(functions, 'verifyAndEnable2fa');

interface TwoFactorAuthSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorAuthSetupDialog({ open, onOpenChange }: TwoFactorAuthSetupDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (open) {
      const generateSecret = async () => {
        setIsLoading(true);
        try {
          const result = await generate2faSecretFn();
          const data = result.data as { secret: string; uri: string };
          setSecret(data.secret);
        } catch (e) {
          console.error(e);
          toast({ title: "秘密鍵の生成に失敗しました", variant: "destructive" });
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      };
      generateSecret();
    }
  }, [open, onOpenChange, toast]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "6桁のコードを入力してください", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    try {
      await verifyAndEnable2faFn({ token: verificationCode });
      toast({ title: "2段階認証が有効になりました", description: "次回ログイン時から認証コードの入力が必要になります。" });
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "コードが正しくないか、有効期限が切れています。";
      console.error(e);
      toast({ title: "認証に失敗しました", description: message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>2段階認証を設定する</DialogTitle>
          <DialogDescription>
            認証アプリ（Google Authenticatorなど）を使って設定してください。
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
            <div className="space-y-4 py-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        ) : (
            <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                    1. 認証アプリを開き、新しいアカウントを追加します。
                </p>
                <p className="text-sm text-muted-foreground">
                    2. QRコードをスキャンする代わりに、「セットアップキー」または「手動入力」を選択し、以下のキーをコピーして貼り付けます。
                </p>
                <div className="p-2 bg-muted rounded-md">
                    <Label htmlFor="secret-key">セットアップキー</Label>
                    <Input id="secret-key" readOnly value={secret} className="font-mono mt-1" />
                </div>
                 <p className="text-sm text-muted-foreground">
                    3. アプリに表示された6桁のコードを以下に入力して、設定を完了します。
                </p>
                <div>
                    <Label htmlFor="code">認証コード</Label>
                    <Input id="code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} placeholder="123456" />
                </div>
            </div>
        )}
        <DialogFooter>
          <Button onClick={handleVerify} disabled={isLoading || isVerifying}>
            {isVerifying ? '検証中...' : '検証して有効化'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
