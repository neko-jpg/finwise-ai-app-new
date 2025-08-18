'use client';

import { SubscriptionsScreen } from '@/components/finwise/subscriptions-screen';
import { useAppData } from '@/contexts/app-data-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionsPage() {
  const { loading, transactions } = useAppData();

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return <SubscriptionsScreen transactions={transactions} />;
}
