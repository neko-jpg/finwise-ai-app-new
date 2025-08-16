import { useState, useEffect } from 'react';
import { differenceInHours } from 'date-fns';
import type { Budget, Task } from '@/lib/domain';
import type { Transaction } from '@/lib/domain';
import { useAuthState } from './use-auth-state';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export function useTasks(transactions: Transaction[], budget: Budget | null): { tasks: Task[], loading: boolean } {
  const { user } = useAuthState();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const newTasks: Task[] = [];

      // 1. Duplicate Transaction Review
      const duplicates = findDuplicateTransactions(transactions);
      if (duplicates.length > 0) {
        newTasks.push({
          id: 'task-duplicates',
          type: 'duplicate_transactions',
          title: '重複した取引を確認',
          description: `${duplicates.length}件の重複の可能性がある取引が見つかりました。`,
          cta: '確認する',
          link: '/reviews?type=duplicates',
          data: { duplicates },
        });
      }

      // 2. Subscription Review
      // This is a placeholder. A more robust subscription detection would be needed.
      const potentialSubscriptions = detectSubscriptions(transactions);
      if (potentialSubscriptions.length > 0) {
        const alreadyReviewed = await hasBeenReviewed('subscription_review', user.uid);
        if (!alreadyReviewed) {
            newTasks.push({
                id: 'task-subscriptions',
                type: 'subscription_review',
                title: 'サブスクリプションを確認',
                description: '定期的な支払いを見直して、節約できるか確認しましょう。',
                cta: '確認する',
                link: '/subscriptions',
                data: { subscriptions: potentialSubscriptions },
            });
        }
      }

      // 3. Budget Review
      if (budget) {
        const alreadyReviewed = await hasBeenReviewed('budget_review', user.uid);
        if (!alreadyReviewed) {
          newTasks.push({
            id: 'task-budget',
            type: 'budget_review',
            title: '今月の予算をレビュー',
            description: '予算を設定または調整して、支出を管理しましょう。',
            cta: '予算設定へ',
            link: '/budget',
          });
        }
      }

      setTasks(newTasks);
      setLoading(false);
    };

    void generateTasks();
  }, [transactions, budget, user]);

  return { tasks, loading };
}

function findDuplicateTransactions(transactions: Transaction[]): Transaction[][] {
  const duplicates: Transaction[][] = [];
  const sorted = [...transactions].sort((a, b) => a.bookedAt.getTime() - b.bookedAt.getTime());

  for (let i = 0; i < sorted.length - 1; i++) {
    const t1 = sorted[i];
    const similar: Transaction[] = [t1];
    for (let j = i + 1; j < sorted.length; j++) {
      const t2 = sorted[j];
      if (
        t1.merchant === t2.merchant &&
        t1.amount === t2.amount &&
        Math.abs(differenceInHours(t1.bookedAt, t2.bookedAt)) <= 24
      ) {
        similar.push(t2);
      }
    }
    if (similar.length > 1) {
      duplicates.push(similar);
      i += similar.length - 1; // Skip checked transactions
    }
  }

  return duplicates;
}

function detectSubscriptions(transactions: Transaction[]): { name: string, count: number, amount: number }[] {
    const merchants: Record<string, { dates: Date[], total: number, count: number }> = {};
    transactions.forEach(t => {
        if(t.amount < 0) {
            if (!merchants[t.merchant]) {
                merchants[t.merchant] = { dates: [], total: 0, count: 0 };
            }
            merchants[t.merchant].dates.push(t.bookedAt);
            merchants[t.merchant].total += Math.abs(t.amount);
            merchants[t.merchant].count++;
        }
    });

    const potentialSubscriptions: { name: string, count: number, amount: number }[] = [];
    for (const merchant in merchants) {
        const data = merchants[merchant];
        const uniqueMonths = new Set(data.dates.map(d => `${d.getFullYear()}-${d.getMonth()}`));
        if (uniqueMonths.size > 1 && data.count > 1) { // Occurs in more than one month
            potentialSubscriptions.push({
                name: merchant,
                count: data.count,
                amount: data.total / data.count,
            });
        }
    }
    return potentialSubscriptions;
}

async function hasBeenReviewed(type: Task['type'], userId: string): Promise<boolean> {
    const monthId = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    const reviewId = `${monthId}-${type}`;
    const reviewRef = collection(db, 'users', userId, 'reviews');
    const q = query(reviewRef, where('id', '==', reviewId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}
