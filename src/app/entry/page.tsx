'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthDialog } from '@/components/finwise/auth-dialog';
import { useAuth } from '@/contexts/AuthContext'; // Use the new context
import { Loader } from 'lucide-react';

export default function EntryPage() {
  const [dialogOpen, setDialogOpen] = useState(true);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth(); // Use the new hook

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect to the dashboard now at /dashboard
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);
  
  useEffect(() => {
      // If the user closes the dialog, send them to the marketing page (now at root)
      if(!dialogOpen && !isAuthenticated) {
          router.push('/');
      }
  }, [dialogOpen, isAuthenticated, router]);


  if (loading || (!loading && isAuthenticated)) {
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
      <main className="marketing-body font-headline">
        <div className="flex h-screen w-screen items-center justify-center">
            <AuthDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen} 
                onSignin={() => router.push('/dashboard')} // Use router push on signin to /dashboard
            />
        </div>
      </main>
  );
}
