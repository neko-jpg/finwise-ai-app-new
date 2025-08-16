'use client';

import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createLinkToken, exchangePublicToken } from '@/ai/flows/plaid-flows';
import type { User } from 'firebase/auth';

interface PlaidLinkButtonProps {
  user: User | null;
  familyId: string | undefined;
}

export const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ user, familyId }) => {
  const { toast } = useToast();
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    const generateToken = async () => {
      if (user) {
        try {
          const token = await createLinkToken({ userId: user.uid });
          setLinkToken(token);
        } catch (error) {
          console.error('Error generating link token:', error);
          toast({
            title: '連携トークンの取得に失敗しました',
            variant: 'destructive',
          });
        }
      }
    };
    void generateToken();
  }, [user, toast]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      if (!familyId) {
        toast({ title: '家族情報が見つかりません', variant: 'destructive' });
        return;
      }
      try {
        await exchangePublicToken({ publicToken: public_token, familyId });
        toast({
          title: '口座が正常に連携されました',
          description: `${metadata.institution?.name} が接続されました。`,
        });
        // Here you would typically trigger a data refresh
      } catch (error) {
        console.error('Error exchanging public token:', error);
        toast({
          title: 'アクセストークンの交換に失敗しました',
          variant: 'destructive',
        });
      }
    },
  });

  return (
    <Button onClick={() => open()} disabled={!ready || !linkToken}>
      新しい口座を連携
    </Button>
  );
};
