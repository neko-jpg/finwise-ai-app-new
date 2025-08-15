import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    Unsubscribe,
    FirestoreError,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/lib/types';

interface UseNotificationsReturn {
    notifications: Notification[];
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useNotifications(
    familyId: string | undefined,
    userId: string | undefined
): UseNotificationsReturn {
    const [familyNotifications, setFamilyNotifications] = useState<Notification[]>([]);
    const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!familyId) {
            setLoading(false);
            return;
        }
        const familyQuery = query(
            collection(db, 'notifications'),
            where('familyId', '==', familyId),
            where('userId', '==', null) // Target family-wide notifications
        );
        const unsubFamily = onSnapshot(familyQuery, (snap) => {
            const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setFamilyNotifications(notifs);
            setLoading(false);
        }, (err) => setError(err));

        return () => unsubFamily();
    }, [familyId]);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        const userQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );
        const unsubUser = onSnapshot(userQuery, (snap) => {
            const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setUserNotifications(notifs);
            setLoading(false);
        }, (err) => setError(err));

        return () => unsubUser();
    }, [userId]);

    const notifications = useMemo(() => {
        const all = [...familyNotifications, ...userNotifications];
        const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
        unique.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        return unique;
    }, [familyNotifications, userNotifications]);

    return { notifications, loading, error };
}
