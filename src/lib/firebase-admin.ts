
import { getApp, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';

function getServiceAccount(): ServiceAccount | null {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson) {
        console.warn(
            'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized. Some server-side features may not work.'
        );
        return null;
    }

    try {
        return JSON.parse(serviceAccountJson);
    } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        return null;
    }
}


export function getFirebaseAdminApp() {
    if (getApps().length) {
        return getApp();
    }

    const serviceAccount = getServiceAccount();

    if (!serviceAccount) {
        // Return a mock or minimal app object if you want to avoid crashes,
        // but for now, we just won't initialize. The calling code should handle this.
        // This function will implicitly return undefined if not initialized.
        // A better approach might be to throw an error or handle it gracefully where called.
        // For now, let's assume the calling context can handle a non-initialized app.
         console.error("Firebase Admin App initialization failed: Service Account is missing or invalid.");
         return null;
    }

    return initializeApp({
        credential: {
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
        },
    });
}
