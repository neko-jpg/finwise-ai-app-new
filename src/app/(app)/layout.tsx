import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/server/firebaseAdmin';
import { AppContainer } from '@/components/finwise/app-container';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
getFirebaseAdminApp();

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    // No session cookie, redirect to marketing page.
    return redirect('/marketing');
  }

  try {
    // Verify the session cookie. This will throw an error if it's not valid.
    await auth().verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error("Session verification failed, redirecting to /marketing:", error);
    // Session cookie is invalid, clear it and redirect to login page.
    cookieStore.set('__session', '', { maxAge: 0 });
    return redirect('/marketing');
  }

  return (
    <div className='dark font-body'>
      <AppContainer>
        {children}
      </AppContainer>
    </div>
  );
}
