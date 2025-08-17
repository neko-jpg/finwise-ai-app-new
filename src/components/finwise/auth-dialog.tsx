'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createUserProfile } from '@/lib/auth';
import { getAdditionalUserInfo, UserCredential, getIdToken } from 'firebase/auth';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth'; // 必要な関数をインポート
import { Loader } from 'lucide-react';

// Googleアイコンのコンポーネントを追加
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.04C34.553 7.79 29.517 5 24 5C13.464 5 5 13.464 5 24s8.464 19 19 19s19-8.464 19-19c0-1.042-.092-2.05-.26-3.009z" />
      <path fill="#FF3D00" d="M6.306 14.691c2.258-2.246 5.34-3.691 8.694-3.691h.083l-3.501 3.501z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-3.52-3.501c-2.19 1.52-4.91 2.441-7.889 2.441-4.756 0-8.86-2.61-10.96-6.417l-3.52 3.501C10.14 39.023 16.63 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083L42 20H24v8h11.303a12.04 12.04 0 0 1-4.083 5.063l3.52 3.501c2.613-2.454 4.26-6.023 4.26-10.063c0-1.042-.092-2.05-.26-3.009z" />
    </svg>
  );
}


interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignin: () => void;
}

// ログイン・登録フォーム用のコンポーネント
function AuthForm({ type, onAuth, onGoogleAuth }: { type: 'login' | 'signup', onAuth: (email: string, pass: string) => Promise<any>, onGoogleAuth: () => Promise<any> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<null | 'email' | 'google'>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    onAuth(email, password).finally(() => setLoading(null));
  };
  
  const handleGoogle = () => {
    setLoading('google');
    onGoogleAuth().finally(() => setLoading(null));
  }

  return (
    <div className="space-y-4 pt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">パスワード</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={!!loading}>
          {loading === 'email' && <Loader className="mr-2 animate-spin" />}
          {type === 'login' ? 'ログイン' : '登録する'}
        </Button>
      </form>
      <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">OR</span></div></div>
      <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={!!loading}>
        {loading === 'google' ? <Loader className="mr-2 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
        Googleで{type === 'login' ? 'ログイン' : '登録'}
      </Button>
    </div>
  );
}


export function AuthDialog({ open, onOpenChange, onSignin }: AuthDialogProps) {
    const { toast } = useToast();

    const _handleAuth = async (authPromise: Promise<UserCredential | null>) => {
        try {
            const userCred = await authPromise;
            if (userCred) {
                if (getAdditionalUserInfo(userCred)?.isNewUser) {
                    await createUserProfile(userCred.user);
                }

                const idToken = await getIdToken(userCred.user);
                await fetch('/api/sessionLogin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                toast({ title: "ログインしました" });
                onSignin();
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            toast({ variant: "destructive", title: "エラー", description: message });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Finwise AIへようこそ</DialogTitle>
                    <DialogDescription>続けるにはログインまたはアカウント登録をしてください。</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">ログイン</TabsTrigger>
                        <TabsTrigger value="signup">登録</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <AuthForm 
                            type="login"
                            onAuth={(email, pass) => _handleAuth(signInWithEmail(email, pass))}
                            onGoogleAuth={() => _handleAuth(signInWithGoogle())}
                        />
                    </TabsContent>
                    <TabsContent value="signup">
                       <AuthForm 
                            type="signup"
                            onAuth={(email, pass) => _handleAuth(signUpWithEmail(email, pass))}
                            onGoogleAuth={() => _handleAuth(signInWithGoogle())}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
