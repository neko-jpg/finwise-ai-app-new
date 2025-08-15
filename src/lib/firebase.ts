import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enablePersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

// Enable offline persistence
if (typeof window !== 'undefined') {
    try {
        enablePersistence(db, { cacheSizeBytes: CACHE_SIZE_UNLIMITED });
    } catch (err: any) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one.
            console.warn('Firestore persistence failed to enable. Multiple tabs open?');
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            console.warn('Firestore persistence is not available in this browser.');
        }
    }
}


export { firebaseApp, db };
