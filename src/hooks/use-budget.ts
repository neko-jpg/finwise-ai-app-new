import { useState, useEffect } from 'react';
import { doc, FirestoreError, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Budget } from '@/domain';
import { budgetConverter } from '@/repo';
import { CATEGORIES } from "@/data/dummy-data";
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

const getDefaultBudget = (id: string, familyId: string, year: number, month: number, scope: 'personal' | 'shared', createdBy: string): Budget => ({
    id,
    familyId,
    year,
    month,
    scope,
    createdBy,
    limits: initialLimits,
    used: {},
    createdAt: new Date(),
    updatedAt: new Date(),
});

export function useBudget(familyId: string | undefined, date: Date, userId: string | undefined): UseBudgetsReturn {
    const [personalBudget, setPersonalBudget] = useState<Budget | null>(null);
    const [sharedBudget, setSharedBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!familyId || !userId) {
            setLoading(false);
            setPersonalBudget(null);
            setSharedBudget(null);
            return;
        }

        setLoading(true);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const period = format(date, 'yyyy-MM');

        const personalPeriodId = `${period}_personal`;
        const sharedPeriodId = `${period}_shared`;

        const personalDocRef = doc(db, `families/${familyId}/budgets`, personalPeriodId).withConverter(budgetConverter);
        const sharedDocRef = doc(db, `families/${familyId}/budgets`, sharedPeriodId).withConverter(budgetConverter);

        const unsubPersonal = onSnapshot(personalDocRef,
            (docSnapshot) => {
                setPersonalBudget(docSnapshot.exists() ? docSnapshot.data() : getDefaultBudget(personalPeriodId, familyId, year, month, 'personal', userId));
            },
            (err) => {
                console.error("useBudget (personal) error:", err);
                setError(err);
            }
        );

        const unsubShared = onSnapshot(sharedDocRef,
            (docSnapshot) => {
                setSharedBudget(docSnapshot.exists() ? docSnapshot.data() : getDefaultBudget(sharedPeriodId, familyId, year, month, 'shared', userId));
            },
            (err) => {
                console.error("useBudget (shared) error:", err);
                setError(err);
            }
        );

        const timer = setTimeout(() => setLoading(false), 1500);

        return () => {
            unsubPersonal();
            unsubShared();
            clearTimeout(timer);
        };
    }, [familyId, date, userId]);

    return { personalBudget, sharedBudget, setPersonalBudget, setSharedBudget, loading, error };
}
