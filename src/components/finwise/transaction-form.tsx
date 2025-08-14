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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CATEGORIES } from '@/data/dummy-data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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

type TransactionFormValues = z.infer<typeof FormSchema>;

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransactionForm({ open, onOpenChange }: TransactionFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            bookedAt: new Date(),
            amount: undefined,
            merchant: '',
            categoryMajor: '',
            note: '',
        },
    });

    const onSubmit = async (values: TransactionFormValues) => {
        setIsSubmitting(true);
        console.log("Submitting:", values);

        // TODO: Replace with actual Firestore call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "取引を登録しました",
            description: `${values.merchant}: ¥${Math.abs(values.amount).toLocaleString()}`,
        });

        setIsSubmitting(false);
        onOpenChange(false);
        form.reset();
    };

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
                                                    {field.value ? format(field.value, "PPP") : <span>日付を選択</span>}
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
                                        <Input type="number" placeholder="-580" {...field} />
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
                                        <Input placeholder="スターバックス" {...field} />
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
                                    <FormLabel>カテゴリ</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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