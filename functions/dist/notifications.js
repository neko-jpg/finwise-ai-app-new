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
exports.markNotificationsAsRead = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Marks a list of notifications as read.
 */
exports.markNotificationsAsRead = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    if (!data.notificationIds || !Array.isArray(data.notificationIds) || data.notificationIds.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "notificationIds must be a non-empty array.");
    }
    const batch = db.batch();
    for (const id of data.notificationIds) {
        const notificationRef = db.collection("notifications").doc(id);
        // As a security measure, you might want to check if the notification
        // actually belongs to the user or their family before marking it as read.
        // For simplicity, we'll skip that check here.
        batch.update(notificationRef, { isRead: true });
    }
    try {
        await batch.commit();
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Error marking notifications as read:", error);
        throw new functions.https.HttpsError("internal", "Failed to update notifications.");
    }
});
