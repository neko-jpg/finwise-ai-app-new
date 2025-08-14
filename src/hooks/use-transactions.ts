
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Unsubscribe, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

interface UseTransactionsReturn {
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useTransactions(uid: string, setTransactions: (transactions: Transaction[]) => void): UseTransactionsReturn {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setTransactions([]);
            return () => {}; // Return an empty function for cleanup
        }

        const transactionsCollectionRef = collection(db, `users/${uid}/transactions`);
        // Order by `bookedAt` for display, but you might also want a secondary sort key like `createdAt` for stable ordering
        const q = query(transactionsCollectionRef, orderBy('bookedAt', 'desc'));

        const unsubscribe: Unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const transactions = querySnapshot.docs.map(doc => {
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
                    } as Transaction;
                });
                setTransactions(transactions);
                setLoading(false);
            },
            (err) => {
                console.error("useTransactions error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [uid, setTransactions]);

    return { loading, error };
}
