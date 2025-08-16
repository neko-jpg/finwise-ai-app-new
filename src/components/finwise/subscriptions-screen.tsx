'use client';
import { useState } from 'react';
import type { Transaction } from '@/domain';
import { detectSubscriptions, DetectSubscriptionsOutput } from '@/ai/flows/detect-subscriptions';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface SubscriptionsScreenProps {
  transactions: Transaction[];
  familyId?: string;
}

export function SubscriptionsScreen({ transactions, familyId: _familyId }: SubscriptionsScreenProps) {
  const [_subscriptions, setSubscriptions] = useState<DetectSubscriptionsOutput['subscriptions']>([]);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    setLoading(true);
    try {
      const result = await detectSubscriptions({ transactions });
      setSubscriptions(result.subscriptions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <Button onClick={handleDetect} disabled={loading}>
            {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Detect Subscriptions
        </Button>
        {/* ... rest of the component */}
    </div>
  );
}
