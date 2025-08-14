import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';

interface UseTransactionsReturn {
    transactions: Transaction[] | null;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useTransactions(uid: string): UseTransactionsReturn {
    const transactionsCollectionRef = uid ? collection(db, `users/${uid}/transactions`) : null;
    const q = transactionsCollectionRef ? query(transactionsCollectionRef, orderBy('bookedAt', 'desc')) : null;

    const [value, loading, error] = useCollection(q);

    const transactions = useMemo(() => {
        if (!value) return null;
        return value.docs.map(doc => {
            const data = doc.data() as DocumentData;
            // Firestore Timestamps need to be converted to JS Dates
            const bookedAt = data.bookedAt?.toDate();
            const createdAt = data.createdAt?.toDate();
            const updatedAt = data.updatedAt?.toDate();
            const clientUpdatedAt = data.clientUpdatedAt?.toDate();
            return { 
                id: doc.id,
                ...data,
                bookedAt,
                createdAt,
                updatedAt,
                clientUpdatedAt,
             } as Transaction
        });
    }, [value]);


    return { transactions, loading: loading || !uid, error };
}
