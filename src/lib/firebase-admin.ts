import { getApp, getApps, initializeApp, type ServiceAccount, cert } from 'firebase-admin/app';

function getServiceAccount(): ServiceAccount | null {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson || serviceAccountJson.trim() === '') {
        // This is a normal and expected case for development environments, so use console.warn
        console.warn(
            '[Server] FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized. Some server-side features may not work.'
        );
        return null;
    }

    try {
        // Defensively trim whitespace and remove potential outer quotes if they exist.
        // This handles cases where the env var might be wrapped in quotes.
        let cleanedJson = serviceAccountJson.trim();
        if ((cleanedJson.startsWith("'") && cleanedJson.endsWith("'")) || (cleanedJson.startsWith('"') && cleanedJson.endsWith('"'))) {
            cleanedJson = cleanedJson.substring(1, cleanedJson.length - 1);
        }
        
        const serviceAccount = JSON.parse(cleanedJson);
        
        // In some environments (like Vercel), newlines in private keys are escaped as '\\n'.
        // We need to replace them with actual newline characters.
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        
        return serviceAccount;
    } catch (e: any) {
        console.error('[Server] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
        return null;
    }
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
