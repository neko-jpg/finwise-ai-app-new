import { useState, useEffect } from 'react';
import { doc, onSnapshot, Unsubscribe, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Family } from '@/domain';
import { familyConverter } from '@/repo';

interface UseFamilyReturn {
    family: Family | null;
    familyId: string | undefined;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useFamily(familyId: string | undefined): UseFamilyReturn {
    const [family, setFamily] = useState<Family | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!familyId) {
            setLoading(false);
            setFamily(null);
            return;
        }

        setLoading(true);
        const familyDocRef = doc(db, 'families', familyId).withConverter(familyConverter);

        const unsubscribe: Unsubscribe = onSnapshot(familyDocRef,
            (doc) => {
                if (doc.exists()) {
                    setFamily(doc.data());
                } else {
                    setFamily(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("useFamily error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();

    }, [familyId]);

    return { family, familyId, loading, error };
}
