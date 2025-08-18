'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { type Transaction, type AuthUser, type Rule } from '@/lib/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { type DateRange } from 'react-day-picker';
import { addDays, isWithinInterval } from 'date-fns';
import { TransactionForm } from './transaction-form';
import { useToast } from '@/hooks/use-toast';

interface TransactionsScreenProps {
  transactions: Transaction[];
  familyId: string;
  user: AuthUser;
  rules: Rule[];
  primaryCurrency: string;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id'>>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createTransaction: (
    transaction: Omit<Transaction, 'id' | 'hash'>,
  ) => Promise<void>;
}

export function TransactionsScreen({
  transactions,
  familyId,
  user,
  rules,
  primaryCurrency,
  updateTransaction,
  deleteTransaction,
  createTransaction,
}: TransactionsScreenProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCreateFormOpen, setCreateFormOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (dateRange?.from && dateRange?.to) {
      const start = dateRange.from;
      const end = dateRange.to;
      filtered = filtered.filter((t) =>
        isWithinInterval(new Date(t.bookedAt), { start, end }),
      );
    }

    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.merchant.toLowerCase().includes(lowercasedFilter) ||
          t.category.major.toLowerCase().includes(lowercasedFilter),
      );
    }

    return filtered.sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime());
  }, [transactions, filter, dateRange]);

  const handleTransactionAction = useCallback(
    async (tx: Transaction, isUpdate: boolean) => {
      if (isUpdate) {
        await updateTransaction(tx.id, tx);
        setEditingTransaction(null);
      } else {
        await createTransaction(tx);
        setCreateFormOpen(false);
      }
    },
    [createTransaction, updateTransaction],
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({ title: 'Transaction deleted' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete transaction.',
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex flex-col md:flex-row items-center gap-2">
          <Input
            placeholder="Filter by description or category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-64"
          />
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
            className="w-full md:w-auto"
          />
          <Button
            onClick={() => setCreateFormOpen(true)}
            className="w-full md:w-auto"
          >
            Add Transaction
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.bookedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.merchant}</TableCell>
                <TableCell>{transaction.category.major}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.amount < 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {transaction.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: transaction.originalCurrency || 'JPY',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Transaction Form */}
      <TransactionForm
        open={isCreateFormOpen}
        onOpenChange={setCreateFormOpen}
        familyId={familyId}
        user={user}
        primaryCurrency={primaryCurrency}
        rules={rules}
        onTransactionAction={handleTransactionAction}
      />

      {/* Edit Transaction Form */}
      {editingTransaction && (
        <TransactionForm
          open={!!editingTransaction}
          onOpenChange={() => setEditingTransaction(null)}
          initialData={editingTransaction}
          familyId={familyId}
          user={user}
          primaryCurrency={primaryCurrency}
          rules={rules}
          onTransactionAction={handleTransactionAction}
        />
      )}
    </div>
  );
}
