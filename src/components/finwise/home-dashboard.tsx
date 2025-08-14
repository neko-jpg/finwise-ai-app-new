
'use client';

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, PiggyBank, Plus, ScanLine } from "lucide-react";
import { AdviceCard } from "./advice-card";
import { QuickActions } from "./quick-actions";
import type { TransactionFormValues } from "./transaction-form";
import type { Transaction, Budget, Goal } from "@/lib/types";
import type { User } from 'firebase/auth';
import { format } from 'date-fns';

interface HomeDashboardProps {
  user?: User;
  transactions?: Transaction[];
  budget?: Budget | null;
  goals?: Goal[];
  setTab?: (t: string) => void;
  onOpenTransactionForm?: (initialData?: Partial<TransactionFormValues>) => void;
  onOpenOcr?: () => void;
  onOpenGoalForm?: () => void;
}

export function HomeDashboard({ 
    transactions = [], 
    budget = null, 
    setTab = () => {}, 
    onOpenTransactionForm = () => {}, 
    onOpenOcr = () => {},
    onOpenGoalForm = () => {}
}: HomeDashboardProps) {

  const todaySpend = useMemo(() => {
    if (!transactions) return 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return transactions
      .filter((t: Transaction) => t.bookedAt && format(t.bookedAt, 'yyyy-MM-dd') === todayStr && t.amount < 0)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
  }, [transactions]);

  const {monthUsed, monthLimit} = useMemo(() => {
    if (!budget || !budget.limits) return { monthUsed: 0, monthLimit: 0 };
    const used = Object.values(budget.used || {}).reduce((a, b) => a + b, 0);
    const limit = Object.values(budget.limits).reduce((a, b) => a + b, 0);
    return { monthUsed: used, monthLimit: limit };
  }, [budget]);
    
  const remain = Math.max(0, monthLimit - monthUsed);
  const usageRate = monthLimit > 0 ? Math.min(100, Math.round((monthUsed / monthLimit) * 100)) : 0;
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-3 flex justify-end gap-2 mb-2">
         <Button onClick={() => onOpenTransactionForm()} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            手入力
          </Button>
          <Button onClick={onOpenOcr}>
            <ScanLine className="h-4 w-4 mr-2" />
            レシート読取
          </Button>
      </div>
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="font-headline flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-muted-foreground" />本日の支出</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-headline">¥{todaySpend.toLocaleString()}</div>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => setTab("tx")}>明細を見る</Button>
            <Button variant="outline" onClick={() => setTab("budget")}>予算を調整</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-headline flex items-center gap-2 text-lg"><PiggyBank className="h-5 w-5 text-muted-foreground" />今月の予算</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium mb-2">残高: ¥{remain.toLocaleString()}</div>
          <Progress value={usageRate} className="h-3"/>
          <div className="mt-2 text-xs text-muted-foreground flex justify-between">
            <span>使用済: ¥{monthUsed.toLocaleString()}</span>
            <span>{usageRate}%</span>
          </div>
        </CardContent>
      </Card>

      <AdviceCard transactions={transactions} budget={budget} />

      <QuickActions onOpenGoalForm={onOpenGoalForm} setTab={setTab} />
    </div>
  );
}
