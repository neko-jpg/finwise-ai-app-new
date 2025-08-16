'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInGuest, signInWithGoogle, signUpWithEmail, signInWithEmail, createUserProfile } from '@/lib/auth';
import { Loader } from 'lucide-react';
import { getAdditionalUserInfo, UserCredential } from 'firebase/auth';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignin: () => void;
}

export function AuthDialog({ open, onOpenChange, onSignin }: AuthDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuth = async (authPromise: Promise<UserCredential | null>) => {
        try {
            const userCred = await authPromise;
            if (userCred && getAdditionalUserInfo(userCred)?.isNewUser) {
                await createUserProfile(userCred.user);
            }
            toast({ title: "ログインしました" });
            onSignin();
        } catch (e: any) {
            toast({ variant: "destructive", title: "エラー", description: e.message });
        } finally {
            setLoading(null);
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
                        {/* Login Form */}
                    </TabsContent>
                    <TabsContent value="signup">
                        {/* Signup Form */}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
