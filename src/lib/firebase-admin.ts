import { getApp, getApps, initializeApp, type ServiceAccount, cert } from 'firebase-admin/app';

function getServiceAccount(): ServiceAccount | null {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        // This is a normal and expected case for development environments, so use console.warn
        console.warn(
            '[Server] Firebase Admin SDK credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not fully set. SDK will not be initialized.'
        );
        return null;
    }

    return {
        projectId,
        clientEmail,
        // In some environments (like Vercel), newlines in private keys are escaped as '\\n'.
        // We need to replace them with actual newline characters.
        privateKey: privateKey.replace(/\\n/g, '\n'),
    };
}


export function getFirebaseAdminApp() {
    if (getApps().length) {
        return getApp();
    }

    const serviceAccount = getServiceAccount();

    if (!serviceAccount) {
         console.error("[Server] Firebase Admin App initialization failed: Service Account is missing or invalid.");
         return null;
    }

    try {
        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch(e: any) {
        console.error("[Server] Firebase Admin App initializeApp failed:", e.message);
        return null;
    }
}
