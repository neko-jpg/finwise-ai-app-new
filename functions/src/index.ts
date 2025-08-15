import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import type { Budget, Transaction } from "../../src/lib/types";

admin.initializeApp();

const db = admin.firestore();

const createNotification = async (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
    return db.collection("notifications").add({
        ...notification,
        userId: notification.userId || null, // Ensure null is written, not undefined
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * A scheduled function that runs once every 24 hours to check for
 * budget overspending and upcoming recurring bills.
 */
export const dailyFinancialCheck = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.info("Starting daily financial check...");
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // --- 1. Check for Budget Overspending ---
    try {
        const budgetsSnapshot = await db.collection("budgets")
            .where("year", "==", year)
            .where("month", "==", month)
            .get();

        for (const budgetDoc of budgetsSnapshot.docs) {
            const budget = budgetDoc.data() as Budget;
            const spent = Object.entries(budget.categoriesSpent || {});

            for (const [category, amountSpent] of spent) {
                const limit = budget.categories[category] || 0;
                if (limit > 0 && (amountSpent / limit) >= 0.8) {
                    await createNotification({
                        familyId: budget.familyId,
                        userId: budget.scope === 'personal' ? budget.createdBy : undefined,
                        type: 'overspending_alert',
                        message: `「${category}」の予算の80%以上を使用しました。(¥${amountSpent.toLocaleString()} / ¥${limit.toLocaleString()})`,
                        link: '/budget',
                    });
                }
            }
        }
    } catch (error) {
        functions.logger.error("Error checking budgets:", error);
    }

    // --- 2. Check for Upcoming Bill Reminders ---
    try {
        const recurringTxQuery = db.collectionGroup("transactions").where("recurring.interval", "in", ["weekly", "monthly", "yearly"]);
        const recurringTxSnapshot = await recurringTxQuery.get();

        for (const txDoc of recurringTxSnapshot.docs) {
            const tx = txDoc.data() as Transaction;
            if (!tx.recurring) continue;

            let nextDueDate: Date;
            const lastDate = tx.bookedAt.toDate();

            switch (tx.recurring.interval) {
                case 'weekly': nextDueDate = addWeeks(lastDate, 1); break;
                case 'monthly': nextDueDate = addMonths(lastDate, 1); break;
                case 'yearly': nextDueDate = addYears(lastDate, 1); break;
                default: continue;
            }

            const threeDaysFromNow = addDays(now, 3);
            if (nextDueDate > now && nextDueDate <= threeDaysFromNow) {
                await createNotification({
                    familyId: tx.familyId,
                    userId: tx.scope === 'personal' ? tx.createdBy : undefined,
                    type: 'bill_reminder',
                    message: `請求リマインダー: 「${tx.merchant}」の次の支払いが${format(nextDueDate, 'M月d日')}に予定されています。`,
                    link: '/transactions',
                });
            }
        }
    } catch (error) {
        functions.logger.error("Error checking for bill reminders:", error);
    }

    functions.logger.info("Daily financial check completed.");
    return null;
  });

export * from "./crypto";
export * from "./stocks";
export * from "./notifications";
export * from "./security";
