'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/finwise/auth-dialog';

export default function EntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(true);

  useEffect(() => {
    // Redirect authenticated users to the dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // If the user closes the dialog without authenticating, redirect to the marketing page
    if (!dialogOpen && !user) {
        router.push('/');
    }
  }, [dialogOpen, user, router]);

  // While loading auth state, show a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  // If the user is authenticated, they will be redirected, so we can return null.
  if (user) {
    return null;
  }

  // If the user is not authenticated, show the auth dialog.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSignin={() => router.push('/dashboard')}
      />
    </div>
  );
}
