'use client';
import { PlaidLinkButton } from '@/components/finwise/plaid-link-button';
import { useAuthState } from '@/hooks/use-auth-state';
import { useUserProfile } from '@/hooks/use-user-profile';

export function LinkScreen() {
    const { user } = useAuthState();
    const { userProfile } = useUserProfile(user?.uid);

    return (
        <div>
            <h1>Link Account</h1>
            <PlaidLinkButton user={user ?? null} familyId={userProfile?.familyId} />
        </div>
    );
}
