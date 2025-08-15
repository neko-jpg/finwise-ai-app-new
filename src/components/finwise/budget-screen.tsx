'use client';
import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader, Sparkles } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { BudgetInput } from './budget-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Budget } from '@/lib/types';
import { CATEGORIES } from "@/data/dummy-data";

interface BudgetScreenProps {
  familyId?: string;
  personalBudget?: Budget | null;
  sharedBudget?: Budget | null;
  setPersonalBudget?: React.Dispatch<React.SetStateAction<Budget | null>>;
  setSharedBudget?: React.Dispatch<React.SetStateAction<Budget | null>>;
  loading?: boolean;
}

export function BudgetScreen({
  familyId,
  personalBudget,
  sharedBudget,
  setPersonalBudget,
  setSharedBudget,
  loading,
}: BudgetScreenProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'personal' | 'shared'>('personal');
  const [isSaving, setIsSaving] = useState(false);

  const activeBudget = activeTab === 'personal' ? personalBudget : sharedBudget;
  const setActiveBudget = activeTab === 'personal' ? setPersonalBudget : setSharedBudget;

  const handleBudgetChange = async (categoryId: string, newLimit: number) => {
    if (!activeBudget || !familyId || !setActiveBudget) return;

    const newLimits = { ...(activeBudget.limits || {}), [categoryId]: newLimit };

    // Optimistic update
    setActiveBudget(prev => (prev ? { ...prev, limits: newLimits } : null));

    setIsSaving(true);
    try {
      const docRef = doc(db, `families/${familyId}/budgets`, activeBudget.id);
      await setDoc(docRef, { limits: newLimits, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "予算を更新しました" });
    } catch (e) {
      console.error(e);
      toast({ title: "予算の更新に失敗しました", variant: "destructive" });
      // TODO: Revert optimistic update on failure
    } finally {
      setIsSaving(false);
    }
  };

  const renderBudgetContent = (budget: Budget | null) => {
    if (!budget) {
      return <div className="text-center py-10"><p className="text-muted-foreground">この月の予算データはありません。</p></div>
    }

    const totalLimit = Object.values(budget.limits || {}).reduce((a, b) => a + b, 0);
    const totalUsed = Object.values(budget.used || {}).reduce((a, b) => a + b, 0);

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{activeTab === 'personal' ? '個人' : '共有'}予算</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-muted-foreground text-sm">合計予算</span>
                <span className="font-bold text-lg font-headline">¥{totalLimit.toLocaleString()}</span>
              </div>
              <Progress value={(totalLimit > 0 ? (totalUsed / totalLimit) : 0) * 100} className="h-3" />
              <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                <span>使用済み: ¥{totalUsed.toLocaleString()}</span>
                <span>残り: ¥{(totalLimit - totalUsed).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-4">
          {CATEGORIES.map((category) => {
            if (category.key === 'income') return null;
            const itemLimit = budget.limits?.[category.key] || 0;
            const itemUsed = budget.used?.[category.key] || 0;
            return (
              <BudgetInput
                key={category.key}
                label={category.label}
                value={itemLimit}
                used={itemUsed}
                onChange={(newValue) => handleBudgetChange(category.key, newValue)}
              />
            );
          })}
        </div>
      </>
    );
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">個人</TabsTrigger>
          <TabsTrigger value="shared">共有</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="pt-4">
          {renderBudgetContent(personalBudget)}
        </TabsContent>
        <TabsContent value="shared" className="pt-4">
          {renderBudgetContent(sharedBudget)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
