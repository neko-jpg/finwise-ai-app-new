
// src/app/page.tsx
'use server';

import { redirect } from "next/navigation";
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { Loader } from 'lucide-react';


async function getUser() {
  const app = getFirebaseAdminApp();
  const auth = getAuth(app);
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return null;
  }
}

export default async function RootPage() {
  const user = await getUser();

  if (user) {
    redirect('/app');
  } else {
    redirect('/marketing');
  }

  // This part is conceptually unreachable due to redirects,
  // but it's good practice to return a fallback UI.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
