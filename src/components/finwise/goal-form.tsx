
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Goal } from '@/lib/types';

const FormSchema = z.object({
  name: z.string().min(1, '目標名は必須です。').max(50, '50文字以内で入力してください。'),
  target: z.coerce.number()
    .positive('目標金額は0より大きい値を入力してください。')
    .max(100_000_000, '金額は1億円以下にしてください。'),
  due: z.date().optional(),
  scope: z.enum(['shared', 'personal']),
});

export type GoalFormValues = z.infer<typeof FormSchema>;

interface GoalFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    familyId: string | undefined;
    user: User | null;
    onGoalAction: (goal: Goal) => void;
}

export function GoalForm({ open, onOpenChange, familyId, user, onGoalAction }: GoalFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<GoalFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            target: '' as any,
            due: undefined,
            scope: 'shared',
        },
    });

    const onSubmit = async (values: GoalFormValues) => {
        if (!familyId || !user) {
            toast({
                variant: 'destructive',
                title: "エラー",
                description: "ユーザー情報が見つかりません。もう一度ログインしてください。",
            });
            return;
        }
        setIsSubmitting(true);
        
        const optimisticId = `optimistic-${Date.now()}`;
        const now = Timestamp.now();

        const optimisticGoal: Goal = {
            id: optimisticId,
            name: values.name,
            target: values.target,
            saved: 0,
            due: values.due || null,
            createdAt: now,
            updatedAt: now,
            scope: values.scope,
            createdBy: user.uid,
        };
        
        // Optimistic Update
        onGoalAction(optimisticGoal);
        onOpenChange(false);
        
        try {
            const docData = {
                name: values.name,
                target: values.target,
                saved: 0, 
                due: values.due || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                scope: values.scope,
                createdBy: user.uid,
            };

            await addDoc(collection(db, `families/${familyId}/goals`), docData);

            toast({
                title: "新しい目標を作成しました！",
                description: `「${values.name}」に向かって頑張りましょう！`,
            });
            // Here you could update the optimistic goal with the real one if needed,
            // but onSnapshot in useGoals should handle it.
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: "目標の作成に失敗しました",
                description: "保存中にエラーが発生しました。もう一度お試しください。",
            });
            // Revert optimistic update
            // onGoalAction(prev => prev.filter(g => g.id !== optimisticId));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (!open) {
          form.reset({
            name: '',
            target: '' as any,
            due: undefined,
          });
        }
    }, [open, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">新しい目標を作成</DialogTitle>
                    <DialogDescription>
                        達成したい目標と金額、期限を設定しましょう。
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>目標名</FormLabel>
                                    <FormControl>
                                        <Input placeholder="台湾旅行" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>目標金額</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="200000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="due"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>目標日 (任意)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "PPP", { locale: ja }) : <span>日付を選択</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                                locale={ja}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>公開範囲</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="shared" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        家族で共有
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="personal" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        自分のみ
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? '保存中...' : '目標を作成する'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
