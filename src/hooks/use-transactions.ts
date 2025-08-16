import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Transaction } from '@/lib/domain';
import { txConverter } from '@/lib/repo';

interface UseTransactionsReturn {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useTransactions(familyId: string | undefined, userId: string | undefined): UseTransactionsReturn {
    const [sharedTransactions, setSharedTransactions] = useState<Transaction[]>([]);
    const [personalTransactions, setPersonalTransactions] = useState<Transaction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    // Merge shared and personal transactions and sort them
    useEffect(() => {
        const allTransactions = [...sharedTransactions, ...personalTransactions];
        const uniqueTransactions = Array.from(new Map(allTransactions.map(t => [t.id, t])).values());
        uniqueTransactions.sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime());
        setTransactions(uniqueTransactions);
    }, [sharedTransactions, personalTransactions]);

    useEffect(() => {
        if (!familyId || !userId) {
            setLoading(false);
            setSharedTransactions([]);
            setPersonalTransactions([]);
            return;
        }

        setLoading(true);
        const transactionsCollectionRef = collection(db, `families/${familyId}/transactions`).withConverter(txConverter);

        // --- Query 1: Get shared transactions ---
        const sharedQuery = query(transactionsCollectionRef, where('scope', '==', 'shared'));
        const unsubscribeShared = onSnapshot(sharedQuery,
            (querySnapshot) => {
                const fetched = querySnapshot.docs.map(doc => doc.data());
                setSharedTransactions(fetched);
                setLoading(false);
            },
            (err) => {
                console.error("useTransactions (shared) error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // --- Query 2: Get personal transactions ---
        const personalQuery = query(transactionsCollectionRef, where('createdBy', '==', userId), where('scope', '==', 'personal'));
        const unsubscribePersonal = onSnapshot(personalQuery,
            (querySnapshot) => {
                const fetched = querySnapshot.docs.map(doc => doc.data());
                setPersonalTransactions(fetched);
                setLoading(false);
            },
            (err) => {
                console.error("useTransactions (personal) error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            unsubscribeShared();
            unsubscribePersonal();
        };
    }, [familyId, userId]);

    return { transactions, setTransactions, loading, error };
}
