'use client';

import { ReviewsScreen } from '@/components/finwise/reviews-screen';
import { useAppData } from '@/contexts/app-data-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewsPage() {
  const { loading, transactions } = useAppData();

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return <ReviewsScreen transactions={transactions} />;
}
