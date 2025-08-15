
import { getApp, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';

function getServiceAccount(): ServiceAccount | null {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson || serviceAccountJson.trim() === '') {
        console.warn(
            '[Server] FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized. Some server-side features may not work.'
        );
        return null;
    }

    try {
        // Defensively trim whitespace and remove potential outer quotes if they exist
        let cleanedJson = serviceAccountJson.trim();
        if ((cleanedJson.startsWith("'") && cleanedJson.endsWith("'")) || (cleanedJson.startsWith('"') && cleanedJson.endsWith('"'))) {
            cleanedJson = cleanedJson.substring(1, cleanedJson.length - 1);
        }
        
        const serviceAccount = JSON.parse(cleanedJson);
        
        // Vercelなどの環境では、改行が '\\n' としてエスケープされることがあるため、これを実際の改行文字 '\n' に置換します。
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
        const { project_id, client_email, private_key } = serviceAccount;
        return initializeApp({
            credential: {
                projectId: project_id,
                clientEmail: client_email,
                privateKey: private_key,
            },
        });
    } catch(e: any) {
        console.error("[Server] Firebase Admin App initializeApp failed:", e.message);
        return null;
    }
}
