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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/lib/domain';

// Firestoreのデータをフロントエンドの型に変換するヘルパー関数
const fromFirestore = (doc: any): Transaction => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    bookedAt: (data.bookedAt as Timestamp).toDate(),
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as Transaction;
};

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
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
        const transactionsData = querySnapshot.docs.map(fromFirestore);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [user],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
      const transactionDoc = doc(db, 'transactions', id);
      await updateDoc(transactionDoc, { ...updates, updatedAt: new Date() });
    },
    [],
  );

  const deleteTransaction = useCallback(async (id: string) => {
    const transactionDoc = doc(db, 'transactions', id);
    await deleteDoc(transactionDoc);
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
