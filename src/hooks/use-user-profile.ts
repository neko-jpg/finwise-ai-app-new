import { useEffect, useState } from 'react';
import { doc, onSnapshot, Unsubscribe, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppUser } from '@/lib/user';

interface UseUserProfileReturn {
    userProfile: AppUser | null;
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useUserProfile(uid: string | undefined): UseUserProfileReturn {
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            setUserProfile(null);
            return;
        }

        setLoading(true);
        const userDocRef = doc(db, `users/${uid}`);

        const unsubscribe: Unsubscribe = onSnapshot(userDocRef,
            (doc) => {
                if (doc.exists()) {
                    setUserProfile(doc.data() as AppUser);
                } else {
                    // This case can happen briefly after signup before the profile is created.
                    // Or if the profile creation failed.
                    setUserProfile(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("useUserProfile error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [uid]);

    return { userProfile, loading, error };
}
