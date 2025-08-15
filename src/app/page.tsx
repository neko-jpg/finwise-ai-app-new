
'use server';

import { redirect } from "next/navigation";
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

async function getUser() {
  // Service Accountが設定されていない開発環境では、常に未認証と見なす
  const app = getFirebaseAdminApp();
  if (!app) {
    return null;
  }

  const auth = getAuth(app);
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedIdToken;
  } catch (error) {
    // セッションクッキーが無効な場合
    console.error('Session cookie verification failed:', error);
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
