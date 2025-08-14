
'use client';

import { HomeDashboard } from '@/components/finwise/home-dashboard';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { useEffect } from 'react';

export default function HomePage(props: any) {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/entry');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Or a loading spinner
  }
  
  return (
    <HomeDashboard {...props} />
  );
}
