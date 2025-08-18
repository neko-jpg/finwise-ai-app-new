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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import type { Transaction, Rule, AuthUser } from '@/lib/domain';
import { applyRulesToTransaction } from '@/lib/rule-engine';
import { createTransactionHash } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  merchant: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  bookedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
  category: z.string().min(1, 'Category is required.'),
  scope: z.enum(['personal', 'shared']).default('personal'),
});

export type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  user: AuthUser;
  primaryCurrency: string;
  rules: Rule[];
  initialData?: Partial<Transaction>;
  onTransactionAction: (
    newTx: Transaction,
    isUpdate: boolean,
  ) => Promise<void>;
}

export function TransactionForm({
  open,
  onOpenChange,
  familyId,
  user,
  primaryCurrency,
  rules,
  initialData,
  onTransactionAction,
}: TransactionFormProps) {
  const { toast } = useToast();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant: '',
      amount: 0,
      bookedAt: new Date().toISOString().substring(0, 10),
      category: '',
      scope: 'personal',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        merchant: initialData.merchant || '',
        amount: Math.abs(initialData.amount || 0),
        bookedAt: initialData.bookedAt
          ? new Date(initialData.bookedAt).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        category: initialData.category?.major || '',
        scope: initialData.scope || 'personal',
      });
    } else {
      form.reset({
        merchant: '',
        amount: 0,
        bookedAt: new Date().toISOString().substring(0, 10),
        category: '',
        scope: 'personal',
      });
    }
  }, [initialData, form]);

  async function handleSubmit(values: TransactionFormValues) {
    const isUpdate = !!initialData?.id;
    const amount = -Math.abs(values.amount); // Assuming all manual entries are expenses for now

    const partialTx: Omit<Transaction, 'id' | 'hash'> = {
      userId: user.uid,
      familyId: familyId,
      amount: amount,
      originalAmount: amount,
      originalCurrency: primaryCurrency,
      merchant: values.merchant,
      bookedAt: new Date(values.bookedAt),
      category: { major: values.category },
      source: 'manual',
      scope: values.scope,
      createdBy: user.uid,
      createdAt: isUpdate ? new Date(initialData!.createdAt!) : new Date(),
      updatedAt: new Date(),
    };

    const ruledTx = applyRulesToTransaction(
      partialTx as Transaction,
      rules,
    ) as Omit<Transaction, 'id' | 'hash'>;
    const hash = createTransactionHash({
      bookedAt: ruledTx.bookedAt,
      merchant: ruledTx.merchant,
      amount: ruledTx.amount,
      originalCurrency: ruledTx.originalCurrency,
    });

    const finalTx: Transaction = {
      ...ruledTx,
      id: initialData?.id || '', // Will be replaced by DB id on creation
      hash,
    };

    try {
      await onTransactionAction(finalTx, isUpdate);
      toast({
        title: `Transaction ${isUpdate ? 'updated' : 'created'}`,
        description: `${finalTx.merchant} for ${finalTx.amount}`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant</FormLabel>
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
                  <FormLabel>Amount (as an expense)</FormLabel>
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
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded">
                      <option value="personal">Personal</option>
                      <option value="shared">Shared</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
