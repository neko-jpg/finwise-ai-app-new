import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addDays, addMonths, addWeeks, addYears, format } from "date-fns";
import type { Budget, Notification, Transaction } from "../../src/lib/types";

// admin.initializeApp()は一度だけでOKです
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// 型定義をより安全にするため、anyではなく具体的な型を指定します
const createNotification = async (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => {
  return db.collection("notifications").add({
    ...notification,
    userId: notification.userId || null,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * 毎日定時に実行され、予算の超過や請求のリマインダーをチェックする関数
 */
export const dailyFinancialCheck = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.info("Starting daily financial check...");
    const now = new Date();

    // --- 1. 予算の超過をチェック ---
    try {
      // collectionGroupを使い、全ファミリーの当月の予算を一括で取得します
      const budgetsSnapshot = await db.collectionGroup("budgets")
        .where("year", "==", now.getFullYear())
        .where("month", "==", now.getMonth() + 1)
        .get();

      for (const budgetDoc of budgetsSnapshot.docs) {
        const budget = budgetDoc.data() as Budget;
        // ドキュメントのパスからfamilyIdを取得します
        const familyId = budgetDoc.ref.parent.parent?.id;

        if (!familyId || !budget.limits || !budget.used) continue;

        for (const category in budget.limits) {
          const limit = budget.limits[category] || 0;
          const used = budget.used[category] || 0;
          
          // 予算の80%を超えたら通知
          if (limit > 0 && (used / limit) >= 0.8) {
            await createNotification({
              familyId: familyId,
              // budget.scopeとcreatedByプロパティを元に、個人か共有かを判断します
              userId: budget.scope === 'personal' ? budget.createdBy : undefined,
              type: 'overspending_alert',
              message: `「${category}」の予算の80%以上を使用しました。(¥${used.toLocaleString()} / ¥${limit.toLocaleString()})`,
              link: '/budget',
            });
          }
        }
      }
    } catch (error) {
      functions.logger.error("Error checking budgets:", error);
    }

    // --- 2. 請求のリマインダーをチェック ---
    try {
      const recurringTxQuery = db.collectionGroup("transactions").where("recurring.interval", "in", ["weekly", "monthly", "yearly"]);
      const recurringTxSnapshot = await recurringTxQuery.get();

      for (const txDoc of recurringTxSnapshot.docs) {
        const tx = txDoc.data() as Transaction;
        if (!tx.recurring || !tx.bookedAt) continue;

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
export * from "./tax-report";
