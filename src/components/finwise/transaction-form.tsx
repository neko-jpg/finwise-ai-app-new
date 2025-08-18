'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/lib/domain';

const formSchema = z.object({
  merchant: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  bookedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
  category: z.string().min(1, 'Category is required.'),
  type: z.enum(['income', 'expense']),
});

// ★★★ 修正点: propsの型定義を修正
interface TransactionFormProps {
  initialData?: Transaction | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant: initialData?.merchant || '',
      amount: Math.abs(initialData?.amount || 0),
      bookedAt: initialData
        ? new Date(initialData.bookedAt).toISOString().substring(0, 10)
        : new Date().toISOString().substring(0, 10),
      category: initialData?.category.major || '',
      type: initialData?.amount && initialData.amount < 0 ? 'expense' : 'income',
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const amount =
      values.type === 'expense' ? -Math.abs(values.amount) : values.amount;
    const submissionData = {
      ...initialData,
      merchant: values.merchant,
      amount,
      bookedAt: new Date(values.bookedAt),
      category: { major: values.category },
    };
    onSubmit(submissionData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* ... フォームフィールドは変更なし ... */}
        <FormField
          control={form.control}
          name="merchant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee shop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bookedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Food" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-2 border rounded">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
