'use client';

import { HomeDashboard } from "@/components/finwise/home-dashboard";
import { useAuthState } from '@/hooks/use-auth-state';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useFamily } from '@/hooks/use-family';
import { useTransactions } from '@/hooks/use-transactions';
import { useBudget } from '@/hooks/use-budget';
import { useGoals } from '@/hooks/use-goals';
import { useTasks } from '@/hooks/use-tasks';

export default function AppPage() {
  const { user, loading: authLoading } = useAuthState();
  const { userProfile, loading: profileLoading } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;

  const today = new Date();

  const { loading: familyLoading } = useFamily(familyId);
  const { transactions, loading: transactionsLoading } = useTransactions(familyId, user?.uid);
  const { sharedBudget, loading: budgetLoading } = useBudget(familyId, today, user?.uid);
  const { goals, loading: goalsLoading } = useGoals(familyId);
  const { tasks, loading: tasksLoading } = useTasks(transactions, sharedBudget);

  const loading = authLoading || profileLoading || familyLoading || transactionsLoading || budgetLoading || goalsLoading || tasksLoading;

  return (
    <HomeDashboard
      user={user ?? undefined}
      tasks={tasks}
      transactions={transactions}
      budget={sharedBudget}
      goals={goals ?? []}
    />
  );
}
