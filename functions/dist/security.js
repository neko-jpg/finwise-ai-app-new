"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAndEnable2fa = exports.generate2faSecret = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const totp_1 = require("./totp");
const db = admin.firestore();
const ISSUER = "Finwise AI"; // The name of the app
/**
 * Generates a new TOTP secret for a user and returns an otpauth:// URI.
 * The secret is stored in a private subcollection of the user's document.
 */
exports.generate2faSecret = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const uid = context.auth.uid;
    const userEmail = context.auth.token.email || "user";
    const secret = (0, totp_1.generateTotpSecret)();
    const uri = `otpauth://totp/${ISSUER}:${userEmail}?secret=${secret}&issuer=${ISSUER}&algorithm=SHA1&digits=6&period=30`;
    // Store the secret securely. A subcollection on the user doc is a good choice.
    const secretRef = db.collection('users').doc(uid).collection('private').doc('security');
    try {
        await secretRef.set({ totpSecret: secret }, { merge: true });
        return { uri, secret }; // Return both for manual entry
    }
    catch (error) {
        functions.logger.error(`Failed to save TOTP secret for user ${uid}:`, error);
        throw new functions.https.HttpsError("internal", "Could not save the secret.");
    }
});
/**
 * Verifies a TOTP token and enables 2FA for the user.
 */
exports.verifyAndEnable2fa = functions.https.onCall(async (data, context) => {
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
        const secret = secretDoc.data().totpSecret;
        const isValid = (0, totp_1.verifyTOTP)(secret, token);
        if (!isValid) {
            throw new functions.https.HttpsError("permission-denied", "The token is invalid or has expired.");
        }
        // Token is valid, enable 2FA for the user
        await userRef.update({ is2faEnabled: true });
        return { success: true, message: "2FA has been successfully enabled." };
    }
    catch (error) {
        functions.logger.error(`Failed to verify token for user ${uid}:`, error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred during token verification.");
    }
});
