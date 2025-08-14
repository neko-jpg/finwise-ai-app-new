import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export { firebaseApp, db };
