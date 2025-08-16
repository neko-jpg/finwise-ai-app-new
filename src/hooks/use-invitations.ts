import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Invitation } from '@/domain';

interface UseInvitationsReturn {
    invitations: Invitation[];
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useInvitations(email: string | null | undefined): UseInvitationsReturn {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!email) {
            setLoading(false);
            setInvitations([]);
            return;
        }

        setLoading(true);
        const invitationsCollectionRef = collection(db, 'invitations');
        const q = query(
            invitationsCollectionRef,
            where('recipientEmail', '==', email),
            where('status', '==', 'pending')
        );

        const unsubscribe: Unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const invitationsData = querySnapshot.docs.map(doc => {
                    return {
                        id: doc.id,
                        ...doc.data()
                     } as Invitation;
                });
                setInvitations(invitationsData);
                setLoading(false);
            },
            (err) => {
                console.error("useInvitations error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();

    }, [email]);

    return { invitations, loading, error };
}
