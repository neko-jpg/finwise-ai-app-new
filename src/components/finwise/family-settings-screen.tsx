'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc, runTransaction, arrayUnion } from 'firebase/firestore';
import { useInvitations } from '@/hooks/use-invitations';
import { useFamily } from '@/hooks/use-family';
import type { User } from 'firebase/auth';
import type { Invitation, Family } from '@/domain';

const FormSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
});

export type InviteFormValues = z.infer<typeof FormSchema>;

interface FamilySettingsScreenProps {
  user?: User;
  familyId?: string;
}

export function FamilySettingsScreen({ user, familyId }: FamilySettingsScreenProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingInvite, setIsProcessingInvite] = useState<string | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!familyId || !user) {
      toast({ title: "エラー", description: "招待を送信するには、まずログインしてください。", variant: "destructive" });
      return;
    }
    if (values.email === user.email) {
      toast({ title: "エラー", description: "自分自身を招待することはできません。", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const newInvitation: Omit<Invitation, 'id'> = {
        familyId,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        recipientEmail: values.email,
        status: 'pending',
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'invitations'), newInvitation);
      toast({ title: "招待を送信しました", description: `${values.email} に招待を送りました。` });
      form.reset();
    } catch (error) {
      console.error("Error sending invitation: ", error);
      toast({ title: "招待の送信に失敗しました", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { invitations, loading: invitationsLoading } = useInvitations(user?.email);
  const { family, loading: familyLoading } = useFamily(familyId);

  const handleAccept = async (invitation: Invitation) => {
    if (!user) return;
    setIsProcessingInvite(invitation.id);
    try {
      await runTransaction(db, async (transaction) => {
        const invRef = doc(db, 'invitations', invitation.id);
        const familyRef = doc(db, 'families', invitation.familyId);
        const userRef = doc(db, 'users', user.uid);
        transaction.update(invRef, { status: 'accepted' });
        transaction.update(familyRef, { members: arrayUnion(user.uid) });
        transaction.update(userRef, { familyId: invitation.familyId });
      });
      toast({ title: "家族へようこそ！" });
    } catch (error) {
      console.error("Error accepting invitation: ", error);
      toast({ title: "処理に失敗しました", variant: "destructive" });
    } finally {
      setIsProcessingInvite(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setIsProcessingInvite(invitationId);
    try {
      const invRef = doc(db, 'invitations', invitationId);
      await updateDoc(invRef, { status: 'declined' });
      toast({ title: "招待を拒否しました" });
    } catch (error) {
      console.error("Error declining invitation: ", error);
      toast({ title: "処理に失敗しました", variant: "destructive" });
    } finally {
      setIsProcessingInvite(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center"><h2 className="text-2xl font-bold font-headline">家族の管理</h2><p className="text-muted-foreground">家族を招待して、一緒に家計を管理しましょう。</p></div>
      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>保留中の招待</CardTitle><CardDescription>あなたは以下の家族に招待されています。</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {invitations.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-2 rounded-md border">
                <div><p className="font-semibold">{invite.senderName}さんの家族</p><p className="text-sm text-muted-foreground">招待メール: {invite.recipientEmail}</p></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDecline(invite.id)} disabled={!!isProcessingInvite}>拒否</Button>
                  <Button size="sm" disabled={!!isProcessingInvite} onClick={() => handleAccept(invite)}>承諾</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>メンバーを招待</CardTitle><CardDescription>招待したい人のメールアドレスを入力してください。</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>招待する相手のメールアドレス</FormLabel>
                    <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? '送信中...' : '招待を送信'}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>現在のメンバー</CardTitle></CardHeader>
        <CardContent>
          {familyLoading && <p>読み込み中...</p>}
          {family && (<ul className="space-y-2">{family.members.map(memberId => (<li key={memberId} className="flex items-center justify-between p-2 rounded-md border"><span>{memberId === user?.uid ? 'あなた' : memberId}</span>{memberId === user?.uid && <span className="text-xs text-muted-foreground">（管理者）</span>}</li>))}</ul>)}
        </CardContent>
      </Card>
    </div>
  );
}
