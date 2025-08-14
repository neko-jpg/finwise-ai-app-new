
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInGuest, signInWithGoogle, signUpWithEmail, signInWithEmail } from '@/lib/auth';
import { Loader } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<null | 'google' | 'email' | 'anonymous'>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthError = (e: any) => {
    console.error("Auth failed", e);
    let description = "もう一度お試しください。";
    switch (e.code) {
      case 'auth/configuration-not-found':
        description = "Firebaseコンソールで認証プロバイダが有効になっていません。プロジェクト設定を確認してください。";
        break;
      case 'auth/network-request-failed':
        description = "ネットワーク接続を確認できませんでした。インターネット接続を確認するか、時間をおいて再度お試しください。";
        break;
      case 'auth/unauthorized-domain':
          description = "このドメインからのログインは許可されていません。FirebaseコンソールのAuthentication設定で、このアプリのドメインを承認済みドメインに追加してください。";
          break;
      case 'auth/popup-blocked':
        description = "ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。";
        break;
      case 'auth/popup-closed-by-user':
        description = "認証ウィンドウが閉じられました。";
        break;
      case 'auth/email-already-in-use':
        description = "このメールアドレスは既に使用されています。ログインするか、別のメールアドレスをお使いください。";
        break;
      case 'auth/weak-password':
        description = "パスワードは6文字以上で入力してください。";
        break;
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        description = "メールアドレスまたはパスワードが正しくありません。";
        break;
      case 'auth/too-many-requests':
        description = "試行回数が多すぎます。しばらくしてからもう一度お試しください。";
        break;
    }
    toast({ title: "認証に失敗しました", description, variant: 'destructive' });
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await signInWithGoogle();
      onOpenChange(false); // Success will be handled by auth state listener
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    try {
      await signUpWithEmail(email, password);
      onOpenChange(false);
      toast({ title: "登録が完了しました", description: "確認メールは送信されません（開発モード）。" });
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    try {
      await signInWithEmail(email, password);
      onOpenChange(false);
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(null);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    setIsLoading('anonymous');
    try {
      await signInGuest();
      onOpenChange(false);
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-center text-2xl">Finwise AIへようこそ</DialogTitle>
          <DialogDescription className="text-center">
            あなたに最適な方法で家計管理をはじめましょう。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full mb-4"
            disabled={!!isLoading}
          >
            {isLoading === 'google' ? <Loader className="animate-spin" /> : 'Googleで続行'}
          </Button>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">ログイン</TabsTrigger>
              <TabsTrigger value="signup">新規登録</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="email-in">メールアドレス</Label>
                  <Input id="email-in" type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pass-in">パスワード</Label>
                  <Input id="pass-in" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading === 'email'}>
                  {isLoading === 'email' ? <Loader className="animate-spin" /> : 'メールアドレスでログイン'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
               <form onSubmit={handleEmailSignUp} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <Label htmlFor="email-up">メールアドレス</Label>
                  <Input id="email-up" type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pass-up">パスワード (6文字以上)</Label>
                  <Input id="pass-up" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading === 'email'}>
                  {isLoading === 'email' ? <Loader className="animate-spin" /> : 'メールアドレスで登録'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>
          
          <Button variant="secondary" className="w-full" onClick={handleAnonymousSignIn} disabled={!!isLoading}>
             {isLoading === 'anonymous' ? <Loader className="animate-spin" /> : '匿名で試す'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
