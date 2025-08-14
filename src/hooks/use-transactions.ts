import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

interface UseTransactionsReturn {
    transactions: Transaction[] | null;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useTransactions(uid: string): UseTransactionsReturn {
    const transactionsCollection = collection(db, `users/${uid}/transactions`);
    const q = query(transactionsCollection, orderBy('bookedAt', 'desc'));

    const [value, loading, error] = useCollection(q);

    const transactions = value ? value.docs.map(doc => {
        const data = doc.data() as DocumentData;
        // Firestore Timestamps need to be converted to JS Dates
        const bookedAt = data.bookedAt?.toDate();
        return { 
            ...data,
            id: doc.id,
            bookedAt,
         } as Transaction
    }) : null;

    return { transactions, loading, error };
}
