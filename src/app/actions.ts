'use server';

import { receiptOcr, ReceiptOcrInput, ReceiptOcrOutput } from "@/ai/flows/receipt-ocr";
import { detectSubscriptions } from "@/ai/flows/detect-subscriptions";
import { adminDb } from '@/lib/firebase/admin';
import { firestore } from 'firebase-admin';
import { JsonValue, JsonObject } from "@/types/global";

// For processReceipt
interface ActionResult {
  success: boolean;
  data?: ReceiptOcrOutput;
  error?: string;
}

// For scanAndTagSubscriptions
interface ScanAndTagResult {
    success: boolean;
    taggedCount?: number;
    error?: string;
}

// Helper function to serialize data with Timestamps for AI flow
const serializeDataForAI = (data: unknown): JsonValue => {
    if (data === null || typeof data !== 'object') {
        return data as JsonValue;
    }
    if (data instanceof firestore.Timestamp) {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(serializeDataForAI);
    }
    const newObj: JsonObject = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newObj[key] = serializeDataForAI((data as Record<string, unknown>)[key]);
        }
    }
    return newObj;
};

export async function scanAndTagSubscriptions(familyId: string): Promise<ScanAndTagResult> {
    if (!familyId) {
        return { success: false, error: "Family ID is required." };
    }

    try {
        const db = adminDb;

        // 1. Fetch recent transactions for the family
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const transactionsSnapshot = await db.collection(`families/${familyId}/transactions`)
            .where('bookedAt', '>=', oneYearAgo)
            .get();

        if (transactionsSnapshot.empty) {
            return { success: true, taggedCount: 0 };
        }

        const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Call the AI flow
        const serializedTransactions = serializeDataForAI(transactions);
        if (!Array.isArray(serializedTransactions)) {
            return { success: false, error: "Failed to serialize transactions." };
        }
        const detectionResult = await detectSubscriptions({ transactions: serializedTransactions });

        if (!detectionResult.subscriptions || detectionResult.subscriptions.length === 0) {
            return { success: true, taggedCount: 0 };
        }

        // 3. Process results and tag transactions
        let taggedCount = 0;
        const batch = db.batch();

        for (const subscription of detectionResult.subscriptions) {
            if (subscription.transactionIds) {
                for (const txId of subscription.transactionIds) {
                    // Check if the transaction exists in our fetched list
                    const txExists = transactions.some(t => t.id === txId);
                    if (txExists) {
                        const txRef = db.doc(`families/${familyId}/transactions/${txId}`);
                        batch.update(txRef, {
                            tags: firestore.FieldValue.arrayUnion('subscription')
                        });
                        taggedCount++;
                    }
                }
            }
        }

        if (taggedCount > 0) {
            await batch.commit();
        }

        return { success: true, taggedCount };

    } catch (e: unknown) {
        console.error("scanAndTagSubscriptions failed:", e);
        return { success: false, error: "サブスクリプションのスキャン中にエラーが発生しました。" };
    }
}

export async function processReceipt(input: ReceiptOcrInput): Promise<ActionResult> {
  try {
    const result = await receiptOcr(input);
    return { success: true, data: result };
  } catch (e: unknown) {
    console.error("Server action processReceipt failed:", e);
    // Return a generic error message to the client for security.
    // The specific error is logged on the server.
    return { success: false, error: "レシートの解析に失敗しました。" };
  }
}

import { assistant, AssistantInput, AssistantOutput } from "@/ai/flows/assistant";

export async function runAssistantAction(input: AssistantInput): Promise<AssistantOutput> {
    return await assistant(input);
}
