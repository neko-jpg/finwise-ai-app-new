
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CATEGORIES } from '@/data/dummy-data';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Transaction, Rule } from '@/lib/types';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { applyRulesToTransaction } from '@/lib/rule-engine';
import { useDebouncedCallback } from 'use-debounce';

const FormSchema = z.object({
  bookedAt: z.date({
    required_error: "日付は必須です。",
  }),
  amount: z.coerce.number()
    .refine(v => v !== 0, { message: "金額は0以外で入力してください。" })
    .refine(v => Math.abs(v) <= 10_000_000, { message: "金額は1,000万円以下にしてください。"}),
  merchant: z.string().min(1, '店名・メモは必須です。'),
  categoryMajor: z.string().min(1, 'カテゴリは必須です。'),
  note: z.string().max(200).optional(),
});

export type TransactionFormValues = z.infer<typeof FormSchema>;

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    uid: string;
    rules: Rule[];
    initialData?: Partial<TransactionFormValues>;
    onTransactionAction: (newTx: Transaction) => void;
}

export function TransactionForm({ open, onOpenChange, uid, rules, initialData, onTransactionAction }: TransactionFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiCategorizing, startAiCategorization] = useTransition();

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            bookedAt: new Date(),
            amount: '' as any,
            merchant: '',
            categoryMajor: '',
            note: '',
        },
    });

    const debouncedCategorize = useDebouncedCallback(() => {
        const merchant = form.getValues('merchant');
        const amount = form.getValues('amount');
        if (merchant && amount && !form.getValues('categoryMajor')) {
            startAiCategorization(async () => {
                try {
                    const result = await categorizeTransaction({ merchant, amount: Number(amount) || 0 });
                    if (result.major && CATEGORIES.some(c => c.key === result.major)) {
                        form.setValue('categoryMajor', result.major, { shouldValidate: true });
                    }
                } catch (e) {
                    console.warn("AI categorization failed", e);
                }
            });
        }
    }, 1000);

    const onSubmit = async (values: TransactionFormValues) => {
        setIsSubmitting(true);
        
        const optimisticId = `optimistic-${Date.now()}`;
        const now = Timestamp.now();
        const SHA256 = require('crypto-js/sha256');
        const hashSource = uid + format(values.bookedAt, 'yyyyMMdd') + values.amount + values.merchant;

        const optimisticTx: Transaction = {
            id: optimisticId,
            bookedAt: values.bookedAt,
            amount: values.amount,
            currency: 'JPY',
            merchant: values.merchant,
            category: { major: values.categoryMajor },
            source: initialData?.amount ? 'ocr' : 'manual',
            note: values.note,
            hash: SHA256(hashSource).toString(),
            clientUpdatedAt: new Date(),
            createdAt: now,
            updatedAt: now,
        };

        const txToSave = applyRulesToTransaction(optimisticTx, rules);

        // Optimistic Update
        onTransactionAction(txToSave);
        onOpenChange(false);

        try {
            const docData = {
              ...txToSave,
              id: undefined, // Firestore generates the ID
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            delete docData.id;

            await addDoc(collection(db, `users/${uid}/transactions`), docData);

            toast({
                title: "取引を登録しました",
                description: `${values.merchant}: ¥${Math.abs(values.amount).toLocaleString()}`,
            });

        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: "登録に失敗しました",
                description: "保存中にエラーが発生しました。もう一度お試しください。",
            });
            // Revert optimistic update
            // onTransactionAction(prev => prev.filter(tx => tx.id !== optimisticId));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (open) {
            form.reset({
                bookedAt: initialData?.bookedAt || new Date(),
                amount: initialData?.amount || ('' as any),
                merchant: initialData?.merchant || '',
                categoryMajor: initialData?.categoryMajor || '',
                note: initialData?.note || '',
            });

            if (initialData?.amount && initialData?.merchant) {
                debouncedCategorize();
            }
        }
    }, [open, initialData, form, debouncedCategorize]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">取引を追加</DialogTitle>
                    <DialogDescription>
                        支出または収入の情報を入力してください。支出はマイナス値で入力します。
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="bookedAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>日付</FormLabel>
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
                                                    {field.value ? format(field.value, "M月d日(E)", { locale: ja }) : <span>日付を選択</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
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
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>金額 (支出は -500 のように入力)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="-580" {...field} onChange={(e) => {
                                            field.onChange(e);
                                            debouncedCategorize();
                                        }}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="merchant"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>店名・メモ</FormLabel>
                                    <FormControl>
                                        <Input placeholder="スターバックス" {...field} onChange={(e) => {
                                            field.onChange(e);
                                            debouncedCategorize();
                                        }}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoryMajor"
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel className="flex items-center gap-2">
                                        カテゴリ
                                        {isAiCategorizing && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="カテゴリを選択" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c.key} value={c.key}>
                                                    <div className="flex items-center gap-2">
                                                        {c.icon}
                                                        {c.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? '保存中...' : '保存'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
