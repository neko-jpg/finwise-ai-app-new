'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Transaction } from '@/lib/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { DateRange } from 'react-day-picker';
import { addDays, isWithinInterval } from 'date-fns';
import { TransactionForm } from './transaction-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// 親コンポーネントから受け取る props の型を定義します
interface TransactionsScreenProps {
  transactions: Transaction[];
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
}

export function TransactionsScreen({
  transactions,
  updateTransaction,
  deleteTransaction,
  createTransaction,
}: TransactionsScreenProps) {
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((t) =>
        isWithinInterval(new Date(t.date), {
          start: dateRange.from!,
          end: dateRange.to!,
        }),
      );
    }

    if (filter) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(filter.toLowerCase()) ||
          t.category.toLowerCase().includes(filter.toLowerCase()),
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, filter, dateRange]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSave = async (updatedTransaction: Transaction) => {
    if (updatedTransaction.id) {
      await updateTransaction(updatedTransaction.id, updatedTransaction);
    }
    setEditingTransaction(null);
  };

  const handleCreate = async (newTransaction: Omit<Transaction, 'id'>) => {
    await createTransaction(newTransaction);
    setCreateDialogOpen(false);
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">Add Transaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm
                onSave={handleCreate}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    transaction.type === 'expense'
                      ? 'text-red-500'
                      : 'text-green-500'
                  }`}
                >
                  {transaction.type === 'expense' ? '-' : ''}$
                  {transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        transaction.id && deleteTransaction(transaction.id)
                      }
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
      {editingTransaction && (
        <Dialog
          open={!!editingTransaction}
          onOpenChange={() => setEditingTransaction(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              onSave={handleSave}
              onCancel={() => setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
