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
import { CATEGORIES, TAX_TAGS } from '@/data/dummy-data';
import { useToast, showErrorToast } from '@/hooks/use-toast';
import { useState, useTransition, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useOnlineStatus } from '@/hooks/use-online-status';
import type { Transaction, Rule } from '@/lib/types';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { getExchangeRate } from '@/ai/flows/exchange-rate';
import { applyRulesToTransaction } from '@/lib/rule-engine';
import type { User } from 'firebase/auth';
import { createTransactionHash } from '@/lib/utils';

const formSchema = z.object({
    amount: z.coerce.number().positive('金額は正の数で入力してください'),
    merchant: z.string().min(1, 'お店やサービス名を入力してください'),
    bookedAt: z.date({ required_error: '日付を選択してください' }),
    categoryMajor: z.string().min(1, 'カテゴリを選択してください'),
    scope: z.enum(['personal', 'shared']).default('personal'),
    taxTag: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    familyId: string;
    user: User;
    primaryCurrency: string;
    rules: Rule[];
    initialData?: Partial<TransactionFormValues>;
    onTransactionAction: (tx: Transaction) => void;
}

const SUPPORTED_CURRENCIES = ['JPY', 'USD', 'EUR', 'GBP', 'AUD'];

export function TransactionForm({ open, onOpenChange, familyId, user, primaryCurrency, rules, initialData, onTransactionAction }: TransactionFormProps) {
    const { toast } = useToast();
    const isOnline = useOnlineStatus();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiCategorizing, startAiCategorization] = useTransition();
    const [aiMessage, setAiMessage] = useState('AIにおまかせ');
    const [selectedCurrency, setSelectedCurrency] = useState(primaryCurrency);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: undefined,
            merchant: '',
            bookedAt: new Date(),
            categoryMajor: '',
            scope: 'personal',
            taxTag: '',
            ...initialData
        },
    });
    
    useEffect(() => {
        if (initialData) {
            form.reset({
                amount: undefined,
                merchant: '',
                bookedAt: new Date(),
                categoryMajor: '',
                scope: 'personal',
                taxTag: '',
                ...initialData
            });
        }
    }, [initialData, form]);


    const aiCategorizeMessages = [
        "AIが思考中...",
        "あなたの支出パターンを分析中...",
        "最適なカテゴリを推測しています...",
        "項目をデータベースと照合中...",
        "最終確認をしています...",
    ];

    useEffect(() => {
        if (isAiCategorizing) {
            let index = 0;
            setAiMessage(aiCategorizeMessages[0]);
            const interval = setInterval(() => {
                index = (index + 1) % aiCategorizeMessages.length;
                setAiMessage(aiCategorizeMessages[index]);
            }, 1500);
            return () => clearInterval(interval);
        } else {
            setAiMessage('AIにおまかせ');
        }
    }, [isAiCategorizing]);

    const handleAiCategorize = () => {
        const merchant = form.getValues('merchant');
        const amount = form.getValues('amount');
        if (!merchant) {
            toast({
                title: 'お店やサービス名が必要です',
                description: 'AIによるカテゴリ分類には、お店やサービス名の入力が必要です。',
                variant: 'destructive',
            });
            return;
        }
        startAiCategorization(async () => {
            try {
                const result = await categorizeTransaction({merchant, amount: amount || 0});
                if (result.major) {
                    form.setValue('categoryMajor', result.major, { shouldValidate: true });
                    toast({
                        title: 'AIがカテゴリを分類しました',
                        description: `「${merchant}」を「${CATEGORIES.find(c => c.key === result.major)?.label}」に分類しました。`,
                    });
                } else {
                    throw new Error('AIによるカテゴリ分類に失敗しました。');
                }
            } catch (error) {
                console.error(error);
                showErrorToast(error);
            }
        });
    };

    const onSubmit = async (values: TransactionFormValues) => {
        setIsSubmitting(true);

        // Offline logic
        if (!isOnline) {
            try {
                const pendingTx = {
                    ...values,
                    id: `pending_${Date.now()}`,
                    familyId,
                    userId: user.uid,
                    status: 'pending',
                    clientTimestamp: new Date().toISOString(),
                };
                const pendingTxs = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
                pendingTxs.push(pendingTx);
                localStorage.setItem('pending_transactions', JSON.stringify(pendingTxs));

                toast({
                    title: 'オフラインのため取引を予約しました',
                    description: 'オンラインになったら自動で同期されます。',
                });
                onOpenChange(false);
                form.reset();
            } catch (e) {
                showErrorToast(new Error("オフライン取引の保存に失敗しました。"));
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Online logic
        try {
            let finalAmount = values.amount;
            if (selectedCurrency !== primaryCurrency) {
                toast({ title: '為替レートを取得中...' });
                const rate = await getExchangeRate({ base: selectedCurrency, target: primaryCurrency });
                finalAmount = values.amount * rate;
                toast({ title: 'レート取得完了', description: `1 ${selectedCurrency} = ${rate.toFixed(2)} ${primaryCurrency}` });
            }

            const newTxData: Omit<Transaction, 'id' | 'hash' | 'createdAt' | 'updatedAt' | 'clientUpdatedAt' | 'deletedAt'> = {
                amount: finalAmount,
                originalAmount: values.amount,
                originalCurrency: selectedCurrency,
                merchant: values.merchant,
                bookedAt: values.bookedAt,
                category: { major: values.categoryMajor },
                source: 'manual',
                scope: values.scope,
                taxTag: values.taxTag || '',
                familyId: familyId,
                createdBy: user.uid,
            };
            
            const ruledTxData = applyRulesToTransaction(newTxData as Transaction, rules);
            const hash = createTransactionHash(ruledTxData);
            
            const docData = {
                ...ruledTxData,
                bookedAt: Timestamp.fromDate(ruledTxData.bookedAt),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                clientUpdatedAt: serverTimestamp(),
                deletedAt: null,
                hash,
            };

            const docRef = await addDoc(collection(db, `families/${familyId}/transactions`), docData);

            const createdTx: Transaction = {
                id: docRef.id,
                ...ruledTxData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                clientUpdatedAt: new Date(),
                hash,
            };

            onTransactionAction(createdTx);

            toast({
                title: '取引が保存されました',
                description: `${values.merchant}への${values.amount.toLocaleString()} ${selectedCurrency}の支出を記録しました。`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Error adding document: ", error);
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>取引を追加</DialogTitle>
                    <DialogDescription>
                        新しい支出または収入を記録します。
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-end gap-2">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>金額</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="例: 3000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>通貨</FormLabel>
                                <Select onValueChange={setSelectedCurrency} value={selectedCurrency}>
                                    <FormControl>
                                        <SelectTrigger className="w-[90px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SUPPORTED_CURRENCIES.map(c => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </div>
                        <FormField
                            control={form.control}
                            name="merchant"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>お店やサービス名</FormLabel>
                                    <FormControl>
                                        <Input placeholder="例: スターバックス" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: ja })
                                                    ) : (
                                                        <span>日付を選択</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="categoryMajor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center justify-between">
                                        カテゴリ
                                        <Button type="button" variant="ghost" size="sm" onClick={handleAiCategorize} disabled={isAiCategorizing}>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            {aiMessage}
                                        </Button>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="カテゴリを選択..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CATEGORIES.map(c => (
                                                <SelectItem key={c.key} value={c.key}>
                                                    {c.label}
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
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="personal" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        個人
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="shared" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        共有
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
                                    <FormLabel>税金関連タグ</FormLabel>
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
