import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/domain';

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: FirestoreError | undefined;
}

export function useNotifications(
  familyId: string | undefined,
  userId: string | undefined
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | undefined>(undefined);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(db, 'families', familyId, 'notifications');

    const q = query(
        notificationsRef,
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedNotifications = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Manual conversion because we don't have a converter for this yet
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Notification;
        });
        setNotifications(fetchedNotifications);
        setLoading(false);
      },
      (err) => {
        console.error('useNotifications error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId, userId]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notifications]);

  return { notifications: sortedNotifications, loading, error };
}
