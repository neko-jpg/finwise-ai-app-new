'use client';
import { SubscriptionsScreen } from '@/components/finwise/subscriptions-screen';
import { useTransactions } from '@/hooks/use-transactions';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuthState } from '@/hooks/use-auth-state';

export default function SubscriptionsPage() {
    const { user } = useAuthState();
    const { userProfile } = useUserProfile(user?.uid);
    const { transactions } = useTransactions(userProfile?.familyId, user?.uid);

    return <SubscriptionsScreen transactions={transactions} familyId={userProfile?.familyId} />;
}
