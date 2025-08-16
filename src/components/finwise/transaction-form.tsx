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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useOnlineStatus } from '@/hooks/use-online-status';
import type { Transaction, Rule } from '@/domain';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { getExchangeRate } from '@/ai/flows/exchange-rate';
import { applyRulesToTransaction } from '@/lib/rule-engine';
import type { User } from 'firebase/auth';
import { createTransactionHash } from '@/lib/utils';
import { txConverter } from '@/repo';

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

const aiCategorizeMessages = ["AIが思考中...", "あなたの支出パターンを分析中...", "最適なカテゴリを推測しています...", "項目をデータベースと照合中...", "最終確認をしています..."];

export function TransactionForm({ open, onOpenChange, familyId, user, primaryCurrency, rules, initialData, onTransactionAction }: TransactionFormProps) {
    const { toast } = useToast();
    const isOnline = useOnlineStatus();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiCategorizing, startAiCategorization] = useTransition();
    const [aiMessage, setAiMessage] = useState('AIにおまかせ');
    const [selectedCurrency, setSelectedCurrency] = useState(primaryCurrency);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { amount: undefined, merchant: '', bookedAt: new Date(), categoryMajor: '', scope: 'personal', taxTag: '', ...initialData },
    });
    
    useEffect(() => {
        if (initialData) {
            form.reset({ amount: undefined, merchant: '', bookedAt: new Date(), categoryMajor: '', scope: 'personal', taxTag: '', ...initialData });
        }
    }, [initialData, form]);

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
            toast({ title: 'お店やサービス名が必要です', description: 'AIによるカテゴリ分類には、お店やサービス名の入力が必要です。', variant: 'destructive' });
            return;
        }
        startAiCategorization(async () => {
            try {
                const result = await categorizeTransaction({merchant, amount: amount || 0});
                if (result.major) {
                    form.setValue('categoryMajor', result.major, { shouldValidate: true });
                    toast({ title: 'AIがカテゴリを分類しました', description: `「${merchant}」を「${CATEGORIES.find(c => c.key === result.major)?.label}」に分類しました。` });
                } else {
                    throw new Error('AIによるカテゴリ分類に失敗しました。');
                }
            } catch (error) {
                showErrorToast(error);
            }
        });
    };

    const onSubmit = async (values: TransactionFormValues) => {
        setIsSubmitting(true);
        try {
            let finalAmount = values.amount;
            if (selectedCurrency !== primaryCurrency) {
                const rate = await getExchangeRate({ base: selectedCurrency, target: primaryCurrency });
                finalAmount = values.amount * rate;
                toast({ title: 'レート取得完了', description: `1 ${selectedCurrency} = ${rate.toFixed(2)} ${primaryCurrency}` });
            }

            const newTxData: Omit<Transaction, 'id' | 'hash'> = {
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
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            
            const ruledTxData = applyRulesToTransaction(newTxData as Transaction, rules);
            const hash = createTransactionHash(ruledTxData);
            const finalTx = { ...ruledTxData, hash, id: '' }; // ID will be set by Firestore

            const txCollectionRef = collection(db, `families/${familyId}/transactions`).withConverter(txConverter);
            const docRef = await addDoc(txCollectionRef, finalTx);

            onTransactionAction({ ...finalTx, id: docRef.id });

            toast({ title: '取引が保存されました', description: `${values.merchant}への${values.amount.toLocaleString()} ${selectedCurrency}の支出を記録しました。` });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            showErrorToast(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>取引を追加</DialogTitle><DialogDescription>新しい支出または収入を記録します。</DialogDescription></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Form fields... */}
                        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? '保存中...' : '保存'}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
