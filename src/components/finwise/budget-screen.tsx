
'use client';
import { useState, useTransition, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/data/dummy-data";
import { Progress } from "@/components/ui/progress";
import type { Budget, Goal, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { budgetPlanner } from '@/ai/flows/budget-planner';
import { Loader, Sparkles } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { BudgetInput } from './budget-input';
import type { User } from 'firebase/auth';


interface BudgetScreenProps {
  user?: User;
  budget?: Budget | null;
  loading?: boolean;
  transactions?: Transaction[];
  goals?: Goal[];
}

export function BudgetScreen({ user, budget, loading, transactions = [], goals = [] }: BudgetScreenProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(budget || null);

  useEffect(() => {
    if (budget) {
      setCurrentBudget(budget);
    }
  }, [budget]);

  const handleBudgetChange = (key: string, value: number) => {
    if (!currentBudget || !user) return;
    
    const newLimits = {
      ...(currentBudget.limits || {}),
      [key]: value,
    };
    
    setCurrentBudget({
        ...currentBudget,
        limits: newLimits
    });
    
    // Save to Firestore optimistically
    startTransition(async () => {
        try {
            const period = format(new Date(), 'yyyy-MM');
            const docRef = doc(db, `users/${user.uid}/budgets`, period);
            await setDoc(docRef, { 
              limits: newLimits,
              updatedAt: serverTimestamp()
            }, { merge: true });
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
      if (!user) return;
      try {
        const result = await budgetPlanner({
            transactions: transactions.map(t => ({...t, bookedAt: t.bookedAt.toISOString()})),
            goals: goals.map(g => ({...g, due: g.due?.toISOString()})),
        });
        const newLimits = { ...currentBudget?.limits };
        result.suggestedBudget.forEach(item => {
          if (CATEGORIES.some(c => c.key === item.key)) {
             newLimits[item.key] = item.limit;
          }
        });
        setCurrentBudget(prev => ({...(prev || {} as Budget), limits: newLimits as any}));
        toast({
          title: "AIが予算を再提案しました",
          description: "支出パターンと目標に合わせて調整しました。",
        });
        
        const period = format(new Date(), 'yyyy-MM');
        const docRef = doc(db, `users/${user.uid}/budgets`, period);
        await setDoc(docRef, { 
          limits: newLimits,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-xl">予算管理</CardTitle>
           <Button variant="outline" onClick={handleAiSuggestion} disabled={isPending}>
            {isPending ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}AIに再提案させる
          </Button>
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
            しきい値（¥20,000）以下の予算はスライダーで、それ以上は直接入力で調整できます。AI提案も活用しましょう。
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CATEGORIES.map((category) => {
          const itemLimit = currentBudget?.limits?.[category.key] || 0;
          const itemUsed = currentBudget?.used?.[category.key] || 0;
          
          return (
            <BudgetInput 
                key={category.key}
                label={category.label}
                value={itemLimit}
                used={itemUsed}
                onChange={(newValue) => handleBudgetChange(category.key, newValue)}
                onAiSuggest={handleAiSuggestion}
            />
          )
        })}
      </div>
    </div>
  );
}
