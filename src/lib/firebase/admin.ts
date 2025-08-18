import { initializeApp, getApps, cert, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { env } from '../env';

const serviceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK
const app: App = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(serviceAccount),
    });

const adminDb: Firestore = getFirestore(app);

/**
 * Creates a session cookie value.
 * @param {string} idToken - The ID token from Firebase.
 * @returns {Promise<{sessionCookie: string, expiresIn: number}>} - The session cookie value and its expiration time.
 */
export async function createSessionCookie(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await getAuth(app).createSessionCookie(idToken, {
    expiresIn,
  });
  return { sessionCookie, expiresIn };
}

/**
 * Verifies the session cookie and gets the auth claims.
 * @param {string} sessionCookie - The session cookie string.
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken | null>} - The decoded claims or null.
 */
export async function verifySession(sessionCookie: string | null) {
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return null;
  }
}

/**
 * Revokes the user's refresh tokens for a given session cookie.
 * @param {string} sessionCookie - The session cookie string.
 */
export async function revokeRefreshTokens(sessionCookie: string) {
    try {
        const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);
        await getAuth(app).revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
        console.log("Could not revoke session, probably already expired or invalid.");
    }
}


export { app as adminApp, adminDb };
