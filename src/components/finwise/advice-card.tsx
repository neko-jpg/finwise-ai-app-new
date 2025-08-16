'use client';
import { useState, useTransition, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, ChevronRight, Info } from "lucide-react";
import { realTimeSaver, RealTimeSaverOutput } from "@/ai/flows/real-time-saver";
import { predictMonthEndBalance, PredictMonthEndBalanceOutput } from "@/ai/flows/predict-month-end-balance";
import { Skeleton } from "../ui/skeleton";
import type { Transaction, Budget } from "@/lib/domain";
import { Timestamp } from "firebase/firestore";

import { JsonValue, JsonObject } from '@/types/global';

interface AdviceCardProps {
    transactions: Transaction[];
    budget: Budget | null;
    currentBalance: number;
}

const convertObjectForServerAction = (obj: unknown): JsonValue => {
    if (!obj || typeof obj !== 'object') return obj as JsonValue;
    if (obj instanceof Date || obj instanceof Timestamp) return obj.toString();
    if (Array.isArray(obj)) return obj.map(convertObjectForServerAction);
    const newObj: JsonObject = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = (obj as Record<string, unknown>)[key];
            if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
                newObj[key] = (value as { toDate: () => Date }).toDate().toISOString();
            } else {
                newObj[key] = convertObjectForServerAction(value);
            }
        }
    }
    return newObj;
};

type Advice = { type: 'tip', content: RealTimeSaverOutput } | { type: 'prediction', content: string };

function isTip(advice: Advice): advice is { type: 'tip', content: RealTimeSaverOutput } {
    return advice.type === 'tip';
}

export function AdviceCard({ transactions, budget, currentBalance }: AdviceCardProps) {
  const [isPending, startTransition] = useTransition();
  const [advice, setAdvice] = useState<Advice[]>([]);

  useEffect(() => {
    if (!transactions || transactions.length === 0) return;
    startTransition(async () => {
        const plainTransactions = convertObjectForServerAction(transactions);
        const plainBudget = convertObjectForServerAction(budget);
        const promises: Promise<Advice | null>[] = [];
        if (budget && Array.isArray(plainTransactions) && typeof plainBudget === 'object') {
            promises.push(realTimeSaver({ transactions: plainTransactions, budget: plainBudget }).then((res: RealTimeSaverOutput): Advice => ({type: 'tip', content: res})).catch(() => null));
        }
        if (currentBalance && Array.isArray(plainTransactions)) {
            promises.push(predictMonthEndBalance({ transactions: plainTransactions, currentBalance }).then((res: PredictMonthEndBalanceOutput): Advice => ({type: 'prediction', content: res.prediction})).catch(() => null));
        }
        try {
            const results = await Promise.all(promises);
            setAdvice(results.filter((r): r is Advice => r !== null));
        } catch (error) {
            console.error("AI insight generation failed", error);
        }
    });
  }, [transactions, budget, currentBalance]);

  const adviceToDisplay = useMemo(() => {
    if (advice.length === 0) return null;
    return advice[Math.floor(Math.random() * advice.length)];
  }, [advice]);

  if (isPending || !adviceToDisplay) {
    return <Card className="md:col-span-3 bg-primary/5 border-primary/20"><CardHeader className="pb-2"><CardTitle className="font-headline flex items-center gap-2 text-lg text-primary"><Sparkles className="h-5 w-5" />今日の一手</CardTitle></CardHeader><CardContent><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent></Card>
  }

  return (
    <Card className="md:col-span-3 bg-primary/5 border-primary/20">
      <CardHeader className="pb-2"><CardTitle className="font-headline flex items-center gap-2 text-lg text-primary"><Sparkles className="h-5 w-5" />今日の一手</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {isTip(adviceToDisplay) ? (
            <>
                <div>
                    <p className="font-medium text-base">{adviceToDisplay.content.savingTip}</p>
                    <p className="text-sm text-muted-foreground mt-1">AIが提案する潜在的な節約額: ¥{adviceToDisplay.content.potentialSavings.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                <Button variant="default" className="gap-1" onClick={() => {}}>実行する<ChevronRight className="h-4 w-4" /></Button>
                <Dialog>
                    <DialogTrigger asChild><Button variant="ghost">理由を見る</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-headline"><Info />提案の根拠</DialogTitle>
                            <DialogDescription className="pt-4 text-left">{adviceToDisplay.content.explanation}</DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                </div>
            </>
        ) : (
            <p className="font-medium text-base">{adviceToDisplay.content}</p>
        )}
      </CardContent>
    </Card>
  );
}
