
'use server';

/**
 * @fileOverview A flow to detect recurring subscriptions from a list of transactions.
 *
 * - detectSubscriptions - A function that handles the subscription detection process.
 * - DetectSubscriptionsInput - The input type for the detectSubscriptions function.
 * - DetectSubscriptionsOutput - The return type for the detectSubscriptions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectSubscriptionsInputSchema = z.object({
  transactions: z.array(z.any()).describe("The user's recent transactions over the last few months."),
});
export type DetectSubscriptionsInput = z.infer<typeof DetectSubscriptionsInputSchema>;

const SubscriptionSchema = z.object({
  name: z.string().describe('The name of the service or merchant.'),
  amount: z.number().describe('The typical monthly amount of the subscription.'),
  interval: z.enum(['月次', '年次', 'その他']).describe('The payment interval.'),
  category: z.string().describe('The category of the subscription (e.g., "動画配信", "音楽", "クラウドストレージ", "ニュース", "仕事").'),
  wasteScore: z.number().min(0).max(1).describe('A score from 0 to 1 indicating how likely this subscription is to be wasteful, based on usage patterns or redundancy. 1.0 means very likely wasteful.'),
  nextDate: z.string().describe('The estimated next payment date in YYYY-MM-DD format.'),
  suggestion: z.string().describe('A concrete, actionable suggestion for the user if there is potential for optimization. E.g., "Consider switching to an annual plan to save money." or "You have multiple video streaming services." If no specific suggestion, provide a general summary.'),
});

const DetectSubscriptionsOutputSchema = z.object({
  subscriptions: z.array(SubscriptionSchema).describe('A list of detected subscriptions.'),
});
export type DetectSubscriptionsOutput = z.infer<typeof DetectSubscriptionsOutputSchema>;

export async function detectSubscriptions(input: DetectSubscriptionsInput): Promise<DetectSubscriptionsOutput> {
  return detectSubscriptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSubscriptionsPrompt',
  input: { schema: DetectSubscriptionsInputSchema },
  output: { schema: DetectSubscriptionsOutputSchema },
prompt: `あなたは賢い家計簿アシスタントです。以下の取引履歴を分析し、定期的・周期的に発生している支払い（サブスクリプション）を特定し、最適化の提案をしてください。

取引履歴:
\`\`\`json
{{{json transactions}}}
\`\`\`

分析のポイント:
- 同じ店名に対して、毎月、毎年など、周期的に支払いが発生しているものを探します。
- 金額がほぼ一定であることも重要な手がかりです。
- 食費や交通費など、明らかにサブスクリプションではないものは除外してください（例: カフェ、スーパー、電車代）。Netflix, Spotify, AWS, 新聞代などが典型的なサブスクリプションです。
- 各サブスクリプションを「動画配信」「音楽」「クラウドストレージ」「ニュース」「仕事」「その他」などのカテゴリに分類してください。
- 各サブスクリプションについて、無駄遣いの可能性を0から1のスコアで評価してください。例えば、あまり使われていないと思われるサービスや、同じカテゴリのサービスが複数ある場合（動画配信サービスが3つあるなど）はスコアを高く設定します。
- 次回の支払い予定日を、過去の支払い日から推測してください。
- 最後に、ユーザーへの具体的な最適化案（suggestion）を考えてください。
  - wasteScoreが高い（0.7以上）場合は、解約を促すような提案をします。（例：「このサービスはあまり利用されていない可能性があります。解約を検討しませんか？」）
  - 同じカテゴリに複数のサブスクがある場合は、統合を提案します。（例：「動画配信サービスに複数登録しています。一つに絞ると節約できます。」）
  - 特に提案がない場合は、そのサービスに関する一般的な情報を提供します。（例：「定額で映画やドラマが見放題のサービスです。」）
  - 提案は、ユーザーが次に行うべきアクションが分かるように、具体的で短い一文にしてください。

結果を構造化されたJSONオブジェクトとして日本語で返してください。`,
});

const detectSubscriptionsFlow = ai.defineFlow(
  {
    name: 'detectSubscriptionsFlow',
    inputSchema: DetectSubscriptionsInputSchema,
    outputSchema: DetectSubscriptionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
