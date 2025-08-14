'use client';
import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES } from "@/data/dummy-data";
import { Progress } from "@/components/ui/progress";
import type { Budget, BudgetItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { budgetPlanner } from '@/ai/flows/budget-planner';
import { Loader } from 'lucide-react';

interface BudgetScreenProps {
  budget: Budget;
  setBudget: React.Dispatch<React.SetStateAction<Budget>>;
}

function impactText(row: BudgetItem) {
    const usageRate = row.limit > 0 ? (row.used / row.limit) * 100 : 100;

    if (usageRate > 95) return "超過傾向。削減案をおすすめします。";
    if (usageRate > 75) return "予算の大部分を使用済みです。";
    if (usageRate > 50) return "無理のない節約余地あり。";
    return "良好。今の配分を維持しましょう。";
}

export function BudgetScreen({ budget, setBudget }: BudgetScreenProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const keys = Object.keys(budget);
  const totalLimit = keys.reduce((a, k) => a + budget[k].limit, 0);
  const totalUsed = keys.reduce((a, k) => a + budget[k].used, 0);

  const handleSave = () => {
    toast({
      title: "予算を保存しました",
      description: "新しい予算設定が適用されました。",
    });
  };

  const handleAiSuggestion = () => {
    startTransition(async () => {
      try {
        const result = await budgetPlanner({});
        const newBudget = { ...budget };
        result.suggestedBudget.forEach(item => {
          if (newBudget[item.key]) {
            newBudget[item.key] = { ...newBudget[item.key], limit: item.limit };
          }
        });
        setBudget(newBudget);
        toast({
          title: "AIが予算を再提案しました",
          description: "支出パターンと目標に合わせて調整しました。",
        });
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
            <Progress value={(totalUsed / totalLimit) * 100} className="h-3" />
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
        {keys.map((k) => {
          const category = CATEGORIES.find(c => c.key === k);
          const itemBudget = budget[k];
          const usageRate = itemBudget.limit > 0 ? (itemBudget.used / itemBudget.limit) * 100 : 0;
          return (
            <Card key={k}>
              <CardHeader className="pb-3">
                <CardTitle className="font-headline flex items-center gap-2 text-base">
                    {category?.icon}
                    {category?.label || k}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">使用済み</span>
                    <span className="font-bold">¥{itemBudget.used.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm text-muted-foreground">予算</span>
                    <span className="font-bold">¥{itemBudget.limit.toLocaleString()}</span>
                </div>
                <Progress value={usageRate} className="h-2" />
                <Slider 
                    value={[itemBudget.limit]} 
                    min={0} 
                    max={Math.max(itemBudget.limit * 2, 50000)}
                    step={1000} 
                    onValueChange={(v) => setBudget((b: Budget) => ({ ...b, [k]: { ...b[k], limit: v[0] } }))} 
                    className="mt-4" 
                />
                <p className="mt-3 text-xs text-muted-foreground h-8">{impactText(itemBudget)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-end rounded-lg p-3 space-x-2 sticky bottom-20 bg-background/80 backdrop-blur-sm">
          <Button variant="outline" onClick={handleAiSuggestion} disabled={isPending}>
            {isPending ? <Loader className="animate-spin" /> : 'AIに再提案させる'}
          </Button>
          <Button onClick={handleSave}>変更を保存</Button>
      </div>
    </div>
  );
}
