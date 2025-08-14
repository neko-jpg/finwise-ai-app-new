
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, PiggyBank, ArrowDown, Plus, ScanLine } from "lucide-react";
import { AdviceCard } from "./advice-card";
import { QuickActions } from "./quick-actions";
import { TransactionFormValues } from "./transaction-form";
import type { Transaction, Budget } from "@/lib/types";
import { useTranslations } from "next-intl";

interface HomeDashboardProps {
  todaySpend: number;
  monthUsed: number;
  monthLimit: number;
  setTab: (t: string) => void;
  onOpenTransactionForm: (initialData?: Partial<TransactionFormValues>) => void;
  onOpenOcr: () => void;
  onOpenGoalForm: () => void;
  transactions: Transaction[];
  budget: Budget | null;
}

export function HomeDashboard({ todaySpend, monthUsed, monthLimit, setTab, onOpenTransactionForm, onOpenOcr, onOpenGoalForm, transactions, budget }: HomeDashboardProps) {
  const t = useTranslations('HomeDashboard');
  const remain = Math.max(0, monthLimit - monthUsed);
  const usageRate = monthLimit > 0 ? Math.min(100, Math.round((monthUsed / monthLimit) * 100)) : 0;
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-3 flex justify-end gap-2 mb-2">
         <Button onClick={() => onOpenTransactionForm()} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t('manual_entry')}
          </Button>
          <Button onClick={onOpenOcr}>
            <ScanLine className="h-4 w-4 mr-2" />
            {t('receipt_scan')}
          </Button>
      </div>
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="font-headline flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-muted-foreground" />{t('today_spend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-headline">¥{todaySpend.toLocaleString()}</div>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => setTab("tx")}>{t('view_transactions')}</Button>
            <Button variant="outline" onClick={() => setTab("budget")}>{t('adjust_budget')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-headline flex items-center gap-2 text-lg"><PiggyBank className="h-5 w-5 text-muted-foreground" />{t('monthly_budget')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium mb-2">{t('balance', {remain: remain.toLocaleString()})}</div>
          <Progress value={usageRate} className="h-3"/>
          <div className="mt-2 text-xs text-muted-foreground flex justify-between">
            <span>{t('used', {used: monthUsed.toLocaleString()})}</span>
            <span>{t('percentage', {usageRate})}</span>
          </div>
        </CardContent>
      </Card>

      <AdviceCard transactions={transactions} budget={budget} />

      <QuickActions onOpenGoalForm={onOpenGoalForm} setTab={setTab} />
    </div>
  );
}
