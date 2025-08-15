import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateTotpSecret, verifyTOTP } from "./totp";

const db = admin.firestore();
const ISSUER = "Finwise AI"; // The name of the app

/**
 * Generates a new TOTP secret for a user and returns an otpauth:// URI.
 * The secret is stored in a private subcollection of the user's document.
 */
export const generate2faSecret = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = context.auth.uid;
    const userEmail = context.auth.token.email || "user";

    const secret = generateTotpSecret();
    const uri = `otpauth://totp/${ISSUER}:${userEmail}?secret=${secret}&issuer=${ISSUER}&algorithm=SHA1&digits=6&period=30`;

    // Store the secret securely. A subcollection on the user doc is a good choice.
    const secretRef = db.collection('users').doc(uid).collection('private').doc('security');

    try {
        await secretRef.set({ totpSecret: secret }, { merge: true });
        return { uri, secret }; // Return both for manual entry
    } catch (error) {
        functions.logger.error(`Failed to save TOTP secret for user ${uid}:`, error);
        throw new functions.https.HttpsError("internal", "Could not save the secret.");
    }
});

/**
 * Verifies a TOTP token and enables 2FA for the user.
 */
export const verifyAndEnable2fa = functions.https.onCall(async (data: { token: string }, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = context.auth.uid;
    const token = data.token;

    if (!token || typeof token !== 'string' || token.length !== 6) {
        throw new functions.https.HttpsError("invalid-argument", "A valid 6-digit token is required.");
    }

    const secretRef = db.collection('users').doc(uid).collection('private').doc('security');
    const userRef = db.collection('users').doc(uid);

    try {
        const secretDoc = await secretRef.get();
        if (!secretDoc.exists || !secretDoc.data()?.totpSecret) {
            throw new functions.https.HttpsError("not-found", "No 2FA secret found for this user. Please start over.");
        }
        const secret = secretDoc.data()!.totpSecret;

        const isValid = verifyTOTP(secret, token);

        if (!isValid) {
            throw new functions.https.HttpsError("permission-denied", "The token is invalid or has expired.");
        }

        // Token is valid, enable 2FA for the user
        await userRef.update({ is2faEnabled: true });

        return { success: true, message: "2FA has been successfully enabled." };

    } catch (error) {
        functions.logger.error(`Failed to verify token for user ${uid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred during token verification.");
    }
});
