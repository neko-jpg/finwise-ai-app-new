
'use client';
import { useState, useTransition, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES, DEMO_GOALS } from "@/data/dummy-data";
import { Progress } from "@/components/ui/progress";
import type { Budget, BudgetItem, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { budgetPlanner } from '@/ai/flows/budget-planner';
import { Loader, Sparkles } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';


interface BudgetScreenProps {
  uid: string;
  budget: Budget | null;
  loading: boolean;
  transactions: Transaction[];
}

function impactText(row: BudgetItem) {
    const usageRate = row.limit > 0 ? (row.used / row.limit) * 100 : 100;

    if (usageRate > 95) return "超過傾向。削減案をおすすめします。";
    if (usageRate > 75) return "予算の大部分を使用済みです。";
    if (usageRate > 50) return "無理のない節約余地あり。";
    return "良好。今の配分を維持しましょう。";
}

export function BudgetScreen({ uid, budget, loading, transactions }: BudgetScreenProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(budget);

  useEffect(() => {
    setCurrentBudget(budget);
  }, [budget]);

  const handleBudgetChange = (key: string, value: number) => {
    setCurrentBudget(prev => {
      if (!prev) return null;
      return {
        ...prev,
        limits: {
          ...prev.limits,
          [key]: value,
        }
      }
    });
  };

  const handleSave = async () => {
    if (!currentBudget) return;
    startTransition(async () => {
      try {
        const period = format(new Date(), 'yyyy-MM');
        const docRef = doc(db, `users/${uid}/budgets`, period);
        await setDoc(docRef, { 
          limits: currentBudget.limits,
          updatedAt: serverTimestamp()
        }, { merge: true });
        toast({
          title: "予算を保存しました",
          description: "新しい予算設定が適用されました。",
        });
      } catch (e) {
         console.error(e);
        toast({
          title: "エラー",
          description: "予算の保存に失敗しました。",
          variant: "destructive",
        });
      }
    });
  };

  const handleAiSuggestion = () => {
    if (transactions.length === 0) {
      toast({
        title: "データがありません",
        description: "AIが提案するには、まず取引をいくつか登録してください。",
        variant: "destructive"
      });
      return;
    }
    startTransition(async () => {
      try {
        const result = await budgetPlanner({
            transactions: transactions.map(t => ({...t, bookedAt: t.bookedAt.toISOString()})),
            goals: DEMO_GOALS,
        });
        const newLimits = { ...currentBudget?.limits };
        result.suggestedBudget.forEach(item => {
          if (CATEGORIES.some(c => c.key === item.key)) {
             newLimits[item.key] = item.limit;
          }
        });
        setCurrentBudget(prev => ({...prev!, limits: newLimits as any}));
        toast({
          title: "AIが予算を再提案しました",
          description: "支出パターンと目標に合わせて調整しました。",
        });
        // Also save the new budget automatically
        if (currentBudget) {
            const period = format(new Date(), 'yyyy-MM');
            const docRef = doc(db, `users/${uid}/budgets`, period);
            await setDoc(docRef, { 
              limits: newLimits,
              updatedAt: serverTimestamp()
            }, { merge: true });
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "エラー",
          description: "AIによる提案の取得に失敗しました。",
          variant: "destructive",
        });
      }
    });
  };
  
  const totalLimit = Object.values(currentBudget?.limits || {}).reduce((a, b) => a + b, 0);
  const totalUsed = Object.values(currentBudget?.used || {}).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">予算管理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-2 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">予算管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-1">
                <span className="text-muted-foreground text-sm">今月の合計予算</span>
                <span className="font-bold text-lg font-headline">¥{totalLimit.toLocaleString()}</span>
            </div>
            <Progress value={(totalLimit > 0 ? (totalUsed / totalLimit) : 0) * 100} className="h-3" />
            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                <span>使用済み: ¥{totalUsed.toLocaleString()}</span>
                <span>残り: ¥{(totalLimit - totalUsed).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pt-4 border-t">
            AIが過去の支出から予算を提案します。各カテゴリの予算はスライダーで調整できます。
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CATEGORIES.map((category) => {
          const itemLimit = currentBudget?.limits?.[category.key] || 0;
          const itemUsed = currentBudget?.used?.[category.key] || 0;
          const usageRate = itemLimit > 0 ? (itemUsed / itemLimit) * 100 : 0;
          return (
            <Card key={category.key}>
              <CardHeader className="pb-3">
                <CardTitle className="font-headline flex items-center gap-2 text-base">
                    {category?.icon}
                    {category?.label || category.key}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">使用済み</span>
                    <span className="font-bold">¥{itemUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm text-muted-foreground">予算</span>
                    <span className="font-bold">¥{itemLimit.toLocaleString()}</span>
                </div>
                <Progress value={usageRate} className="h-2" />
                <Slider 
                    value={[itemLimit]} 
                    min={0} 
                    max={Math.max(itemLimit * 2, 50000)}
                    step={1000} 
                    onValueChange={(v) => handleBudgetChange(category.key, v[0])}
                    className="mt-4" 
                />
                <p className="mt-3 text-xs text-muted-foreground h-8">{impactText({limit: itemLimit, used: itemUsed})}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-end rounded-lg p-3 space-x-2 sticky bottom-20 bg-background/80 backdrop-blur-sm">
          <Button variant="outline" onClick={handleAiSuggestion} disabled={isPending}>
            {isPending ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}AIに再提案させる
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader className="animate-spin h-4 w-4 mr-2" /> : null}変更を保存
          </Button>
      </div>
    </div>
  );
}
