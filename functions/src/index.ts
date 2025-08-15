import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * A scheduled function that runs once every 24 hours.
 * This function will be responsible for checking user financials
 * and sending notifications.
 */
export const dailyFinancialCheck = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.info("Starting daily financial check...");
    const db = admin.firestore();
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const budgetPeriod = `${year}-${month}`;

    try {
      const familiesSnapshot = await db.collection("families").get();
      if (familiesSnapshot.empty) {
        functions.logger.info("No families found. Exiting.");
        return null;
      }

      for (const familyDoc of familiesSnapshot.docs) {
        const familyId = familyDoc.id;
        const budgetRef = db.doc(`families/${familyId}/budgets/${budgetPeriod}`);
        const budgetDoc = await budgetRef.get();

        if (budgetDoc.exists) {
          const budget = budgetDoc.data();
          if (budget && budget.limits && budget.used) {
            for (const category in budget.limits) {
              const limit = budget.limits[category] || 0;
              const used = budget.used[category] || 0;
              if (limit > 0) {
                const usage = (used / limit) * 100;
                if (usage >= 80) {
                  functions.logger.warn(
                    `Budget alert for family ${familyId}`,
                    {
                      familyId: familyId,
                      category: category,
                      usage: usage.toFixed(2),
                      limit: limit,
                      used: used,
                    }
                  );
                  // In Phase 2, we would send a notification here.
                }
              }
            }
          }
        }
      }
      functions.logger.info("Daily financial check completed successfully.");
    } catch (error) {
      functions.logger.error("Error during daily financial check:", error);
    }

    return null;
  });

export * from "./crypto";
export * from "./stocks";
