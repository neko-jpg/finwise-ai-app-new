'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/lib/domain';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(transactionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const createTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id'>) => {
      if (!user) return;
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId: user.uid,
      });
    },
    [user],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      const transactionDoc = doc(db, 'transactions', id);
      await updateDoc(transactionDoc, updates);
    },
    [],
  );

  const deleteTransaction = useCallback(async (id: string) => {
    const transactionDoc = doc(db, 'transactions', id);
    await deleteDoc(transactionDoc);
  }, []);

  // ★★★ 修正点 ★★★
  // create, update, delete関数を return するように変更
  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
