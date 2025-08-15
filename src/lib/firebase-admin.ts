import { getApp, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';

const serviceAccount: ServiceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

export function getFirebaseAdminApp() {
    if (getApps().length) {
        return getApp();
    }

    return initializeApp({
        credential: {
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
        },
    });
}
