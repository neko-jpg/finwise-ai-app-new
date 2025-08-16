
'use client';

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, ChevronRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { realTimeSaver, RealTimeSaverOutput } from "@/ai/flows/real-time-saver";
import { predictMonthEndBalance } from "@/ai/flows/predict-month-end-balance";
import { Skeleton } from "../ui/skeleton";
import type { Transaction, Budget } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

interface AdviceCardProps {
    transactions: Transaction[];
    budget: Budget | null;
    currentBalance: number;
}

const convertObjectForServerAction = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date || obj instanceof Timestamp) return obj.toString();
    if (Array.isArray(obj)) return obj.map(convertObjectForServerAction);

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (value && typeof value.toDate === 'function') { // Firestore Timestamp
                newObj[key] = value.toDate().toISOString();
            } else {
                newObj[key] = convertObjectForServerAction(value);
            }
        }
    }
    return newObj;
};


export function AdviceCard({ transactions, budget, currentBalance }: AdviceCardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [advice, setAdvice] = useState<RealTimeSaverOutput | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);

  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    startTransition(async () => {
        const plainTransactions = convertObjectForServerAction(transactions);
        const plainBudget = convertObjectForServerAction(budget);
        
        // Run both flows in parallel
        const promises = [];
        if (budget) {
            promises.push(realTimeSaver({ transactions: plainTransactions, budget: plainBudget }));
        }
        if (currentBalance) {
            promises.push(predictMonthEndBalance({ transactions: plainTransactions, currentBalance }));
        }

        try {
            const [adviceResult, predictionResult] = await Promise.all(promises);
            if (adviceResult) setAdvice(adviceResult);
            if (predictionResult) setPrediction(predictionResult.prediction);
        } catch (error) {
            console.error("AI insight generation failed", error);
        }
    });
  }, [transactions, budget, currentBalance]);


  const handleAction = () => {
    toast({
      title: "アクションを記録しました",
      description: "目標達成に向けて素晴らしい一歩です！",
    });
  };

  const adviceToDisplay = useMemo(() => {
    const availableAdvice = [];
    if (advice) availableAdvice.push({ type: 'tip', content: advice });
    if (prediction) availableAdvice.push({ type: 'prediction', content: prediction });

    if (availableAdvice.length === 0) return null;
    if (availableAdvice.length === 1) return availableAdvice[0];
    return availableAdvice[Math.floor(Math.random() * availableAdvice.length)];
  }, [advice, prediction]);

  if (isPending || !adviceToDisplay) {
    return (
        <Card className="md:col-span-3 bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="font-headline flex items-center gap-2 text-lg text-primary">
                    <Sparkles className="h-5 w-5" />
                    今日の一手
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="md:col-span-3 bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="font-headline flex items-center gap-2 text-lg text-primary">
          <Sparkles className="h-5 w-5" />
          今日の一手
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {adviceToDisplay.type === 'prediction' ? (
            <p className="font-medium text-base">{adviceToDisplay.content}</p>
        ) : (
            <>
                <div>
                    <p className="font-medium text-base">{adviceToDisplay.content.savingTip}</p>
                    <p className="text-sm text-muted-foreground mt-1">AIが提案する潜在的な節約額: ¥{adviceToDisplay.content.potentialSavings.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                <Button variant="default" className="gap-1" onClick={handleAction}>
                    実行する
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost">理由を見る</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-headline"><Info />提案の根拠</DialogTitle>
                            <DialogDescription className="pt-4 text-left">
                                {adviceToDisplay.content.explanation}
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
