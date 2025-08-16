import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Rule } from '@/lib/domain';

interface UseRulesReturn {
    rules: Rule[];
    loading: boolean;
    error: Error | null;
}

export function useRules(uid: string | undefined): UseRulesReturn {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setRules([]);
            return;
        }

        setLoading(true);
        const rulesCollectionRef = collection(db, `users/${uid}/rules`);
        const q = query(rulesCollectionRef, where("deletedAt", "==", null));

        const unsubscribe: Unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const rulesData: Rule[] = [];
                querySnapshot.forEach((doc) => {
                    rulesData.push({ id: doc.id, ...doc.data() } as Rule);
                });
                // We might need to sort by priority here in the future
                setRules(rulesData);
                setLoading(false);
            },
            (err) => {
                console.error("useRules error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    return { rules, loading, error };
}
