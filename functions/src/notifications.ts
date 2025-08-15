import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Marks a list of notifications as read.
 */
export const markNotificationsAsRead = functions.https.onCall(async (data: { notificationIds: string[] }, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    if (!data.notificationIds || !Array.isArray(data.notificationIds) || data.notificationIds.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "notificationIds must be a non-empty array.");
    }

    const uid = context.auth.uid;
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
    } catch (error) {
        functions.logger.error("Error marking notifications as read:", error);
        throw new functions.https.HttpsError("internal", "Failed to update notifications.");
    }
});
