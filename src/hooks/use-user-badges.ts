import { useEffect, useState } from 'react';
import { collection, onSnapshot, Unsubscribe, FirestoreError, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserBadge } from '@/lib/types';

interface UseUserBadgesReturn {
    userBadges: UserBadge[];
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useUserBadges(uid: string | undefined): UseUserBadgesReturn {
    const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setUserBadges([]);
            return;
        }

        setLoading(true);
        const badgesCollectionRef = collection(db, `users/${uid}/badges`);
        const q = query(badgesCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe: Unsubscribe = onSnapshot(q,
            (snapshot) => {
                const badges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserBadge));
                setUserBadges(badges);
                setLoading(false);
            },
            (err) => {
                console.error("useUserBadges error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [uid]);

    return { userBadges, loading, error };
}
