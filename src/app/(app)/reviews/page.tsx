'use client';

import { ReviewsScreen } from '@/components/finwise/reviews-screen';
import { useTransactions } from '@/hooks/use-transactions';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuthState } from '@/hooks/use-auth-state';

export default function ReviewsPage() {
    const { user } = useAuthState();
    const { userProfile } = useUserProfile(user?.uid);
    const { transactions } = useTransactions(userProfile?.familyId, user?.uid);

    return <ReviewsScreen transactions={transactions} />;
}
