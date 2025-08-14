
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Unsubscribe, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

interface UseTransactionsReturn {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useTransactions(uid: string | undefined): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setTransactions([]);
            return () => {}; // Return an empty function for cleanup
        }
        
        setLoading(true);
        const transactionsCollectionRef = collection(db, `users/${uid}/transactions`);
        const q = query(transactionsCollectionRef, orderBy('bookedAt', 'desc'));

        const unsubscribe: Unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const fetchedTransactions = querySnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData;
                    // Firestore Timestamps need to be converted to JS Dates
                    const bookedAt = data.bookedAt?.toDate();
                    const createdAt = data.createdAt; // Keep as Timestamp
                    const updatedAt = data.updatedAt; // Keep as Timestamp
                    const deletedAt = data.deletedAt?.toDate();
                    const clientUpdatedAt = data.clientUpdatedAt?.toDate();

                    return { 
                        id: doc.id,
                        ...data,
                        bookedAt,
                        createdAt,
                        updatedAt,
                        deletedAt,
                        clientUpdatedAt,
                    } as Transaction;
                });
                setTransactions(fetchedTransactions);
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
    }, [uid]);

    return { transactions, setTransactions, loading, error };
}
