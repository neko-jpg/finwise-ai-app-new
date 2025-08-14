'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, PiggyBank, ArrowDown, Plus, ScanLine } from "lucide-react";
import { AdviceCard } from "./advice-card";
import { QuickActions } from "./quick-actions";
import { TransactionFormValues } from "./transaction-form";

interface HomeDashboardProps {
  todaySpend: number;
  monthUsed: number;
  monthLimit: number;
  setTab: (t: string) => void;
  onOpenTransactionForm: (initialData?: Partial<TransactionFormValues>) => void;
  onOpenOcr: () => void;
}

export function HomeDashboard({ todaySpend, monthUsed, monthLimit, setTab, onOpenTransactionForm, onOpenOcr }: HomeDashboardProps) {
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
          <p className="mt-1 text-sm text-muted-foreground flex items-center">
            <ArrowDown className="h-4 w-4 mr-1 text-green-500" />
            昨日比 <span className="text-green-500 font-semibold ml-1">-12%</span>
          </p>
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

      <AdviceCard />

      <QuickActions />
    </div>
  );
}
