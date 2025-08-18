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

export function useTransactions(familyId?: string, userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const baseCollection = collection(db, 'families', familyId, 'transactions');
    const q = userId
      ? query(baseCollection, where('userId', '==', userId))
      : query(baseCollection);

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
  }, [familyId, userId]);

  const createTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'hash'>) => {
      if (!familyId) {
        throw new Error('Family ID is not available to create transaction.');
      }
      const coll = collection(db, 'families', familyId, 'transactions');
      await addDoc(coll, {
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
    [familyId],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
      if (!familyId) {
        throw new Error('Family ID is not available to update transaction.');
      }
      const transactionDoc = doc(db, 'families', familyId, 'transactions', id);
      await updateDoc(transactionDoc, { ...updates, updatedAt: new Date() });
    },
    [familyId],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!familyId) {
        throw new Error('Family ID is not available to delete transaction.');
      }
      const transactionDoc = doc(db, 'families', familyId, 'transactions', id);
      await deleteDoc(transactionDoc);
    },
    [familyId],
  );

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions, // Manually update state after offline sync
  };
}
