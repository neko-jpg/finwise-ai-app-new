
// src/app/page.tsx
'use server';

import { redirect } from "next/navigation";
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';


async function getUser() {
  const app = getFirebaseAdminApp();
  if (!app) {
    // If admin app isn't initialized (e.g., service account not set),
    // we can't verify the session. Assume no user is logged in.
    console.warn("[Server Auth] Firebase Admin App not initialized. Cannot verify session cookie.");
    return null;
  }

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
    // Clear the potentially invalid cookie
    cookies().set('session', '', { expires: new Date(0) });
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
}
