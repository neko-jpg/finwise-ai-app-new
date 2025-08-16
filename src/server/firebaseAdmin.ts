import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase/admin';

// This guard is crucial for environments where the Admin SDK cannot be initialized
// (e.g., client-side, or server-side without credentials).
const auth = () => {
    if (!adminApp) {
        throw new Error("Firebase Admin App not initialized. Ensure server environment variables are set.");
    }
    return getAuth(adminApp);
}

export { auth };
