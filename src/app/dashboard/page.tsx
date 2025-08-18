'use client';

import { HomeDashboard } from '@/components/finwise/home-dashboard';
import { useTasks } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { tasks, loading } = useTasks();

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <HomeDashboard tasks={tasks} />;
}
