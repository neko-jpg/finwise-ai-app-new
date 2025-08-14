'use server';

/**
 * @fileOverview A flow to parse receipt images and extract transaction data.
 *
 * - receiptOcr - A function that handles the receipt parsing process.
 * - ReceiptOcrInput - The input type for the receiptOcr function.
 * - ReceiptOcrOutput - The return type for the receiptOcr function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReceiptOcrInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReceiptOcrInput = z.infer<typeof ReceiptOcrInputSchema>;

const ReceiptOcrOutputSchema = z.object({
    merchant: z.string().describe('The name of the merchant or store.'),
    amount: z.number().describe('The total amount of the transaction. This should be a negative number as it is an expense.'),
    bookedAt: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
});
export type ReceiptOcrOutput = z.infer<typeof ReceiptOcrOutputSchema>;

export async function receiptOcr(input: ReceiptOcrInput): Promise<ReceiptOcrOutput> {
  return receiptOcrFlow(input);
}

const prompt = ai.definePrompt({
  name: 'receiptOcrPrompt',
  input: { schema: ReceiptOcrInputSchema },
  output: { schema: ReceiptOcrOutputSchema },
  prompt: `レシートの画像を分析し、以下の情報を抽出してください。

- 店名 (merchant)
- 合計金額 (amount): 支出なので、必ず負の数にしてください。
- 取引日 (bookedAt): YYYY-MM-DD形式で返してください。

画像から日付が読み取れない場合は、今日の日付を使用してください。

画像: {{media url=photoDataUri}}

構造化されたJSONオブジェクトとして日本語で出力してください。`,
});

const receiptOcrFlow = ai.defineFlow(
  {
    name: 'receiptOcrFlow',
    inputSchema: ReceiptOcrInputSchema,
    outputSchema: ReceiptOcrOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
