
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, DocumentData, FirestoreError, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Budget } from '@/lib/types';
import { useMemo } from 'react';
import { INITIAL_BUDGET, CATEGORIES } from '@/data/dummy-data';

interface UseBudgetReturn {
    budget: Budget | null;
    loading: boolean;
    error: FirestoreError | undefined;
}

// Dummy initial limits for new users
const initialLimits = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = INITIAL_BUDGET[cat.key as keyof typeof INITIAL_BUDGET]?.limit || 0;
    return acc;
}, {} as {[key: string]: number});


export function useBudget(uid: string, period: string): UseBudgetReturn {
    const budgetDocRef = uid ? doc(db, `users/${uid}/budgets`, period) : null;
    const [value, loading, error] = useDocument(budgetDocRef);

    const budget = useMemo(() => {
        if (!uid) {
            return {
                id: period,
                limits: initialLimits,
                used: {},
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            } as Budget;
        }

        if (!value) return null;

        if (!value.exists()) {
             // If document doesn't exist for the period, return a default structure
            return {
                id: period,
                limits: initialLimits,
                used: {},
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            } as Budget;
        }

        const data = value.data() as DocumentData;
        return {
            id: value.id,
            ...data,
            // Ensure limits and used are at least empty objects to prevent runtime errors
            limits: data.limits || initialLimits,
            used: data.used || {},
        } as Budget;

    }, [value, period, uid]);

    return { budget, loading: loading || !uid, error };
}
