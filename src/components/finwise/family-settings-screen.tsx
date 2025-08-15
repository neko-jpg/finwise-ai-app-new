'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Invitation } from '@/lib/user';

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

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!familyId || !user) {
      toast({
        title: "エラー",
        description: "招待を送信するには、まずログインしてください。",
        variant: "destructive",
      });
      return;
    }

    if (values.email === user.email) {
      toast({
        title: "エラー",
        description: "自分自身を招待することはできません。",
        variant: "destructive",
      });
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
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'invitations'), newInvitation);

      toast({
        title: "招待を送信しました",
        description: `${values.email} に招待を送りました。相手が承認すると、家族に加わります。`,
      });
      form.reset();
    } catch (error) {
      console.error("Error sending invitation: ", error);
      toast({
        title: "招待の送信に失敗しました",
        description: "時間をおいて再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline">家族の管理</h2>
        <p className="text-muted-foreground">家族を招待して、一緒に家計を管理しましょう。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>メンバーを招待</CardTitle>
          <CardDescription>
            招待したい人のメールアドレスを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>招待する相手のメールアドレス</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '送信中...' : '招待を送信'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>現在のメンバー</CardTitle>
        </CardHeader>
        <CardContent>
          <p>（ここに現在の家族メンバーのリストが入ります）</p>
        </CardContent>
      </Card>
    </div>
  );
}
