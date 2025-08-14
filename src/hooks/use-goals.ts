
import { useState, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, DocumentData, FirestoreError, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Goal } from '@/lib/types';

interface UseGoalsReturn {
    goals: Goal[] | null;
    setGoals: React.Dispatch<React.SetStateAction<Goal[] | null>>;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useGoals(uid: string | undefined): UseGoalsReturn {
    const [goals, setGoals] = useState<Goal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setGoals([]);
            return;
        }

        setLoading(true);
        const goalsCollectionRef = collection(db, `users/${uid}/goals`);
        const q = query(goalsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe: Unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const goalsData = querySnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData;
                    // Firestore Timestamps need to be converted to JS Dates for client-side use
                    const due = data.due?.toDate();
                    const createdAt = data.createdAt; // Keep as Timestamp for sorting
                    const updatedAt = data.updatedAt;
                    return { 
                        id: doc.id,
                        ...data,
                        due,
                        createdAt,
                        updatedAt,
                     } as Goal;
                });
                setGoals(goalsData);
                setLoading(false);
            },
            (err) => {
                console.error("useGoals error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [uid]);

    return { goals, setGoals, loading, error };
}
