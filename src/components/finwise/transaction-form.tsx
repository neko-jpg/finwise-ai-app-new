
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import type { Transaction } from '@/lib/types';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { getExchangeRate } from '@/ai/flows/exchange-rate';
import { useDebouncedCallback } from 'use-debounce';
import { TAX_TAGS } from '@/data/dummy-data';

const FormSchema = z.object({
  bookedAt: z.date({
    required_error: "日付は必須です。",
  }),
  originalAmount: z.coerce.number()
    .refine(v => v !== 0, { message: "金額は0以外で入力してください。" })
    .refine(v => Math.abs(v) <= 10_000_000, { message: "金額は1,000万円以下にしてください。"}),
  originalCurrency: z.string().length(3),
  merchant: z.string().min(1, '店名・メモは必須です。'),
  categoryMajor: z.string().min(1, 'カテゴリは必須です。'),
  note: z.string().max(200).optional(),
  scope: z.enum(['shared', 'personal']),
  taxTag: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof FormSchema>;

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    familyId: string | undefined;
    user: User | null;
    primaryCurrency: string;
    initialData?: Partial<TransactionFormValues>;
    onTransactionAction: (newTx: Transaction) => void;
}

export function TransactionForm({ open, onOpenChange, familyId, user, primaryCurrency, initialData, onTransactionAction }: TransactionFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiCategorizing, startAiCategorization] = useTransition();

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            bookedAt: new Date(),
            originalAmount: '' as any,
            originalCurrency: primaryCurrency || 'JPY',
            merchant: '',
            categoryMajor: '',
            note: '',
            scope: 'shared',
            taxTag: '',
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
        if (!familyId || !user) {
            toast({ variant: 'destructive', title: "エラー", description: "ユーザー情報が見つかりません。もう一度ログインしてください。" });
            return;
        }

        setIsSubmitting(true);
        
        try {
            let finalAmount = values.originalAmount;
            if (values.originalCurrency !== primaryCurrency) {
                const rate = await getExchangeRate({ base: values.originalCurrency, target: primaryCurrency });
                finalAmount = values.originalAmount * rate;
            }

            const optimisticId = `optimistic-${Date.now()}`;
            const now = Timestamp.now();
            const SHA256 = require('crypto-js/sha256');
            const hashSource = familyId + format(values.bookedAt, 'yyyyMMdd') + values.originalAmount + values.merchant;

            const newTxData: Omit<Transaction, 'id'> = {
                bookedAt: values.bookedAt,
                amount: finalAmount,
                originalAmount: values.originalAmount,
                originalCurrency: values.originalCurrency,
                merchant: values.merchant,
                category: { major: values.categoryMajor },
                source: initialData?.originalAmount ? 'ocr' : 'manual',
                note: values.note,
                hash: SHA256(hashSource).toString(),
                clientUpdatedAt: new Date(),
                createdAt: serverTimestamp() as Timestamp,
                updatedAt: serverTimestamp() as Timestamp,
                scope: values.scope,
                createdBy: user.uid,
                taxTag: values.taxTag || undefined,
            };

            const optimisticTx: Transaction = {
                ...newTxData,
                id: optimisticId,
                createdAt: now,
                updatedAt: now,
            };

            // Optimistic Update
            onTransactionAction(optimisticTx);
            onOpenChange(false);

            await addDoc(collection(db, `families/${familyId}/transactions`), {
                ...newTxData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({
                title: "取引を登録しました",
                description: `${values.merchant}: ${values.originalAmount.toLocaleString()} ${values.originalCurrency}`,
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

                        <div className="flex gap-2">
                            <FormField
                                control={form.control}
                                name="originalAmount"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>金額 (支出は -500)</FormLabel>
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
                                name="originalCurrency"
                                render={({ field }) => (
                                <FormItem className="w-[100px]">
                                    <FormLabel>通貨</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="JPY">JPY</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </FormItem>
                                )}
                            />
                        </div>

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

                        <FormField
                            control={form.control}
                            name="taxTag"
                            render={({ field }) => (
                                <FormItem>
                                     <FormLabel>税金関連タグ (任意)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="タグを選択..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="">タグなし</SelectItem>
                                            {TAX_TAGS.map(t => (
                                                <SelectItem key={t.key} value={t.key}>
                                                    {t.label}
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
