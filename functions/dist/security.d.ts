import * as functions from "firebase-functions";
/**
 * Generates a new TOTP secret for a user and returns an otpauth:// URI.
 * The secret is stored in a private subcollection of the user's document.
 */
export declare const generate2faSecret: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Verifies a TOTP token and enables 2FA for the user.
 */
export declare const verifyAndEnable2fa: functions.HttpsFunction & functions.Runnable<any>;
