import { useState, useEffect } from 'react';
import { doc, DocumentData, FirestoreError, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Budget } from '@/lib/types';
import { CATEGORIES } from '@/data/dummy-data';
import { format } from 'date-fns';

interface UseBudgetsReturn {
    personalBudget: Budget | null;
    sharedBudget: Budget | null;
    setPersonalBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
    setSharedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
    loading: boolean;
    error: FirestoreError | undefined;
}

const initialLimits = CATEGORIES.reduce((acc, cat) => {
    if (cat.key !== 'income') {
        acc[cat.key] = 10000;
    }
    return acc;
}, {} as {[key: string]: number});

const getDefaultBudget = (id: string): Budget => ({
    id,
    limits: initialLimits,
    used: {},
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
} as Budget);

export function useBudget(familyId: string | undefined, date: Date): UseBudgetsReturn {
    const [personalBudget, setPersonalBudget] = useState<Budget | null>(null);
    const [sharedBudget, setSharedBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!familyId) {
            setLoading(false);
            setPersonalBudget(null);
            setSharedBudget(null);
            return () => {};
        }

        setLoading(true);
        const period = format(date, 'yyyy-MM');
        const personalPeriodId = `${period}_personal`;
        const sharedPeriodId = `${period}_shared`;

        const personalDocRef = doc(db, `families/${familyId}/budgets`, personalPeriodId);
        const sharedDocRef = doc(db, `families/${familyId}/budgets`, sharedPeriodId);

        const unsubPersonal = onSnapshot(personalDocRef,
            (docSnapshot) => {
                setPersonalBudget(docSnapshot.exists() ? { id: docSnapshot.id, ...docSnapshot.data() } as Budget : getDefaultBudget(personalPeriodId));
            },
            (err) => {
                console.error("useBudget (personal) error:", err);
                setError(err);
            }
        );

        const unsubShared = onSnapshot(sharedDocRef,
            (docSnapshot) => {
                setSharedBudget(docSnapshot.exists() ? { id: docSnapshot.id, ...docSnapshot.data() } as Budget : getDefaultBudget(sharedPeriodId));
            },
            (err) => {
                console.error("useBudget (shared) error:", err);
                setError(err);
            }
        );

        // Combined loading state
        const checkLoading = () => {
            if (personalBudget !== null && sharedBudget !== null) {
                setLoading(false);
            }
        };
        // This is a simplified loading state. A more robust solution might be needed.
        // For now, we'll just set it to false after a short delay, assuming listeners have attached.
        const timer = setTimeout(() => setLoading(false), 1500);


        return () => {
            unsubPersonal();
            unsubShared();
            clearTimeout(timer);
        };
    }, [familyId, date]);

    return { personalBudget, sharedBudget, setPersonalBudget, setSharedBudget, loading, error };
}
