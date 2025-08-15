'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaidLinkButton } from './plaid-link-button';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { User } from 'firebase/auth';

interface InvestmentsScreenProps {
  user?: User;
}

export function InvestmentsScreen({ user }: InvestmentsScreenProps) {
  const { userProfile } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline">投資</h2>
        <p className="text-muted-foreground">ポートフォリオを連携して、資産を追跡しましょう。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>連携済み口座</CardTitle>
        </CardHeader>
        <CardContent>
          <p>（ここに連携済み口座のリストが表示されます）</p>
          <div className="mt-4">
            <PlaidLinkButton user={user || null} familyId={familyId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
