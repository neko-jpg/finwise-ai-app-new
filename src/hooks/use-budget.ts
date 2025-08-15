
import { useState, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, DocumentData, FirestoreError, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Budget } from '@/lib/types';
import { CATEGORIES } from '@/data/dummy-data';

interface UseBudgetReturn {
    budget: Budget | null;
    setBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
    loading: boolean;
    error: FirestoreError | undefined;
}

const initialLimits = CATEGORIES.reduce((acc, cat) => {
    if (cat.key !== 'income') { // Don't set initial limit for income
        acc[cat.key] = 10000; 
    }
    return acc;
}, {} as {[key: string]: number});

const defaultBudget: Omit<Budget, 'id'> = {
    limits: initialLimits,
    used: {},
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
};

export function useBudget(familyId: string | undefined, period: string): UseBudgetReturn {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);
    
    useEffect(() => {
        if (!familyId) {
            setLoading(false);
            setBudget(null);
            return;
        }

        setLoading(true);
        const budgetDocRef = doc(db, `families/${familyId}/budgets`, period);

        const unsubscribe: Unsubscribe = onSnapshot(budgetDocRef, 
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data() as DocumentData;
                    setBudget({
                        id: docSnapshot.id,
                        limits: data.limits || initialLimits,
                        used: data.used || {},
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                    } as Budget);
                } else {
                    // Document doesn't exist, use a default structure
                    setBudget({
                        id: period,
                        ...defaultBudget
                    });
                }
                setLoading(false);
            },
            (err) => {
                console.error("useBudget error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [familyId, period]);

    return { budget, setBudget, loading, error };
}
