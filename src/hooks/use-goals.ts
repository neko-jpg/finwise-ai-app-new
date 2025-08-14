
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Goal } from '@/lib/types';
import { useMemo } from 'react';

interface UseGoalsReturn {
    goals: Goal[] | null;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useGoals(uid: string): UseGoalsReturn {
    const goalsCollection = collection(db, `users/${uid}/goals`);
    const q = query(goalsCollection, orderBy('createdAt', 'desc'));

    const [value, loading, error] = useCollection(q);

    const goals = useMemo(() => {
        return value ? value.docs.map(doc => {
            const data = doc.data() as DocumentData;
            const due = data.due?.toDate();
            const createdAt = data.createdAt?.toDate();
            const updatedAt = data.updatedAt?.toDate();
            return { 
                id: doc.id,
                ...data,
                due,
                createdAt,
                updatedAt,
             } as Goal
        }) : null;
    }, [value]);


    return { goals, loading, error };
}
