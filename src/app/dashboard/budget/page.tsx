'use client'; // Keep it a client component to use hooks

import { Suspense } from "react";
import { BudgetScreen } from '@/components/finwise/budget-screen';
import { useBudget } from '@/hooks/use-budget';
import { useTransactions } from '@/hooks/use-transactions';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuthState } from '@/hooks/use-auth-state';

// This is a valid Next.js page component.
// It was previously invalid because it was trying to accept non-serializable props.
// Now, it's a self-contained client component that fetches its own data.
function BudgetPageComponent() {
  const { user } = useAuthState();
  const { userProfile } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;

  const { transactions } = useTransactions(familyId, user?.uid);
  const { personalBudget, sharedBudget, setPersonalBudget, setSharedBudget } = useBudget(
    familyId,
    new Date(),
    user?.uid
  );

  return (
    <BudgetScreen
      personalBudget={personalBudget}
      sharedBudget={sharedBudget}
      setPersonalBudget={setPersonalBudget}
      setSharedBudget={setSharedBudget}
      transactions={transactions}
    />
  );
}

export default function BudgetPage() {
    return (
        <Suspense fallback={<div>Loading budget…</div>}>
            <BudgetPageComponent />
        </Suspense>
    )
}
