import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enablePersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "finwise-ai-s18cs",
  "appId": "1:1016695664403:web:798a406d41c0f52a5734e6",
  "storageBucket": "finwise-ai-s18cs.firebasestorage.app",
  "apiKey": "AIzaSyB6_ckmGVee3vM-LgykEVXnrJbAOW2PeTU",
  "authDomain": "finwise-ai-s18cs.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1016695664403"
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
