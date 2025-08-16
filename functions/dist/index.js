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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyFinancialCheck = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const date_fns_1 = require("date-fns");
// admin.initializeApp()は一度だけでOKです
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
// 型定義をより安全にするため、anyではなく具体的な型を指定します
const createNotification = async (notification) => {
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
exports.dailyFinancialCheck = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async () => {
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
            const budget = budgetDoc.data();
            // ドキュメントのパスからfamilyIdを取得します
            const familyId = budgetDoc.ref.parent.parent?.id;
            if (!familyId || !budget.limits || !budget.used)
                continue;
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
    }
    catch (error) {
        functions.logger.error("Error checking budgets:", error);
    }
    // --- 2. 請求のリマインダーをチェック ---
    try {
        const recurringTxQuery = db.collectionGroup("transactions").where("recurring.interval", "in", ["weekly", "monthly", "yearly"]);
        const recurringTxSnapshot = await recurringTxQuery.get();
        for (const txDoc of recurringTxSnapshot.docs) {
            const tx = txDoc.data();
            if (!tx.recurring || !tx.bookedAt)
                continue;
            let nextDueDate;
            const lastDate = tx.bookedAt.toDate();
            switch (tx.recurring.interval) {
                case 'weekly':
                    nextDueDate = (0, date_fns_1.addWeeks)(lastDate, 1);
                    break;
                case 'monthly':
                    nextDueDate = (0, date_fns_1.addMonths)(lastDate, 1);
                    break;
                case 'yearly':
                    nextDueDate = (0, date_fns_1.addYears)(lastDate, 1);
                    break;
                default: continue;
            }
            const threeDaysFromNow = (0, date_fns_1.addDays)(now, 3);
            if (nextDueDate > now && nextDueDate <= threeDaysFromNow) {
                await createNotification({
                    familyId: tx.familyId,
                    userId: tx.scope === 'personal' ? tx.createdBy : undefined,
                    type: 'bill_reminder',
                    message: `請求リマインダー: 「${tx.merchant}」の次の支払いが${(0, date_fns_1.format)(nextDueDate, 'M月d日')}に予定されています。`,
                    link: '/transactions',
                });
            }
        }
    }
    catch (error) {
        functions.logger.error("Error checking for bill reminders:", error);
    }
    functions.logger.info("Daily financial check completed.");
    return null;
});
__exportStar(require("./crypto"), exports);
__exportStar(require("./stocks"), exports);
__exportStar(require("./notifications"), exports);
__exportStar(require("./security"), exports);
__exportStar(require("./tax-report"), exports);
