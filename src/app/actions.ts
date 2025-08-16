'use server';

import { receiptOcr, ReceiptOcrInput, ReceiptOcrOutput } from "@/ai/flows/receipt-ocr";

interface ActionResult {
  success: boolean;
  data?: ReceiptOcrOutput;
  error?: string;
}

export async function processReceipt(input: ReceiptOcrInput): Promise<ActionResult> {
  try {
    const result = await receiptOcr(input);
    return { success: true, data: result };
  } catch (e: any) {
    console.error("Server action processReceipt failed:", e);
    // Return a generic error message to the client for security.
    // The specific error is logged on the server.
    return { success: false, error: "レシートの解析に失敗しました。" };
  }
}
