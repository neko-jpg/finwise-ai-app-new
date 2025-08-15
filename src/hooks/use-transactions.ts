import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';

interface UseTransactionsReturn {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    loading: boolean;
    error: FirestoreError | undefined;
}

// Hookの引数にuserIdを追加します。呼び出し元でuser.uidを渡す必要があります。
export function useTransactions(familyId: string | undefined, userId: string | undefined): UseTransactionsReturn {
    const [sharedTransactions, setSharedTransactions] = useState<Transaction[]>([]);
    const [personalTransactions, setPersonalTransactions] = useState<Transaction[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    // 共有トランザクションと個人トランザクションをマージしてソートします
    useEffect(() => {
        const allTransactions = [...sharedTransactions, ...personalTransactions];
        // Mapを使ってIDの重複を排除します
        const uniqueTransactions = Array.from(new Map(allTransactions.map(t => [t.id, t])).values());
        // 日付で降順にソートします
        uniqueTransactions.sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime());
        setTransactions(uniqueTransactions);
    }, [sharedTransactions, personalTransactions]);

    useEffect(() => {
        // familyIdまたはuserIdがない場合は何もしません
        if (!familyId || !userId) {
            setLoading(false);
            setSharedTransactions([]);
            setPersonalTransactions([]);
            return;
        }

        setLoading(true);
        const transactionsCollectionRef = collection(db, `families/${familyId}/transactions`);

        // --- クエリ1: 共有トランザクションを取得 ---
        // 'scope'が'shared'のものを取得します
        const sharedQuery = query(transactionsCollectionRef, where('scope', '==', 'shared'));
        const unsubscribeShared = onSnapshot(sharedQuery,
            (querySnapshot) => {
                const fetched = querySnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData;
                    return {
                        id: doc.id,
                        ...data,
                        bookedAt: data.bookedAt?.toDate(),
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        deletedAt: data.deletedAt?.toDate(),
                        clientUpdatedAt: data.clientUpdatedAt?.toDate(),
                    } as Transaction;
                });
                setSharedTransactions(fetched);
                setLoading(false); // どちらかのクエリが終われば一旦ローディングを解除
            },
            (err) => {
                console.error("useTransactions (shared) error:", err);
                setError(err);
                setLoading(false);
            }
        );

        // --- クエリ2: 個人のトランザクションを取得 ---
        // 'createdBy'が自分のIDで、'scope'が'personal'のものを取得します
        const personalQuery = query(transactionsCollectionRef, where('createdBy', '==', userId), where('scope', '==', 'personal'));
        const unsubscribePersonal = onSnapshot(personalQuery,
            (querySnapshot) => {
                const fetched = querySnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData;
                    return {
                        id: doc.id,
                        ...data,
                        bookedAt: data.bookedAt?.toDate(),
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        deletedAt: data.deletedAt?.toDate(),
                        clientUpdatedAt: data.clientUpdatedAt?.toDate(),
                    } as Transaction;
                });
                setPersonalTransactions(fetched);
                setLoading(false); // どちらかのクエリが終われば一旦ローディングを解除
            },
            (err) => {
                console.error("useTransactions (personal) error:", err);
                setError(err);
                setLoading(false);
            }
        );


        // コンポーネントがアンマウントされた時に購読を解除します
        return () => {
            unsubscribeShared();
            unsubscribePersonal();
        };
    }, [familyId, userId]);

    return { transactions, setTransactions, loading, error };
}
