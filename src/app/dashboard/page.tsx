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
  const { user, loading: _authLoading } = useAuthState();
  const { userProfile, loading: _profileLoading } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;

  const today = new Date();

  const { loading: _familyLoading } = useFamily(familyId);
  const { transactions, loading: _transactionsLoading } = useTransactions(familyId, user?.uid);
  const { sharedBudget, loading: _budgetLoading } = useBudget(familyId, today, user?.uid);
  const { goals, loading: _goalsLoading } = useGoals(familyId);
  const { tasks, loading: _tasksLoading } = useTasks(transactions, sharedBudget);

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
