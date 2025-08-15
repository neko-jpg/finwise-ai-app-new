'use client';

import { useState, useMemo } from 'react';
import { DateRange } from "react-day-picker"
import { startOfMonth } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSankey } from '@nivo/sankey';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxReport } from './tax-report';
import { ContributionTracker } from './contribution-tracker';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import type { User } from 'firebase/auth';
import type { Transaction, Account } from '@/lib/types';
import { CATEGORIES } from '@/data/dummy-data';

interface ReportsScreenProps {
  user?: User;
  transactions: Transaction[];
  accounts: Account[];
  loading?: boolean;
}

export function ReportsScreen({ user, transactions, accounts, loading }: ReportsScreenProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from) return transactions;
    return transactions.filter(t => {
      const txDate = new Date(t.bookedAt);
      const from = dateRange.from!;
      const to = dateRange.to || from; // If only 'from' is selected, treat it as a single day
      // Set hours to include the whole day
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return txDate >= from && txDate <= to;
    });
  }, [transactions, dateRange]);

  const sankeyData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return { nodes: [], links: [] };
    const nodes: { id: string }[] = [];
    const links: { source: string; target: string; value: number }[] = [];
    const incomeNode = { id: '収入' };
    const expenseRootNode = { id: '支出' };
    nodes.push(incomeNode);
    nodes.push(expenseRootNode);
    let totalIncome = 0;
    const expensesByCategory: { [key: string]: number } = {};
    for (const t of filteredTransactions) {
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        const category = t.category.major;
        if (!expensesByCategory[category]) expensesByCategory[category] = 0;
        expensesByCategory[category] += Math.abs(t.amount);
      }
    }
    if (totalIncome > 0) links.push({ source: incomeNode.id, target: expenseRootNode.id, value: totalIncome });
    for (const categoryKey in expensesByCategory) {
      const categoryLabel = CATEGORIES.find(c => c.key === categoryKey)?.label || categoryKey;
      nodes.push({ id: categoryLabel });
      links.push({ source: expenseRootNode.id, target: categoryLabel, value: expensesByCategory[categoryKey] });
    }
    return { nodes, links };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline">レポート</h2>
        <p className="text-muted-foreground">お金の流れを視覚的に分析しましょう。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>期間を選択</CardTitle>
          <CardDescription>レポートの対象となる期間を指定してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </CardContent>
      </Card>

      <Tabs defaultValue="sankey" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sankey">月次フロー</TabsTrigger>
          <TabsTrigger value="tax">税務レポート</TabsTrigger>
          <TabsTrigger value="contribution">拠出額</TabsTrigger>
        </TabsList>
        <TabsContent value="sankey">
          <Card className="mt-4">
            <CardHeader><CardTitle>期間レポート (Sankey図)</CardTitle><CardDescription>選択した期間の収入がどのように支出に流れているかを確認します。</CardDescription></CardHeader>
            <CardContent>
              <div style={{ height: 400 }} className="bg-muted rounded-lg">
                {sankeyData.nodes.length > 2 ? (
                  <ResponsiveSankey data={sankeyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} align="justify" colors={{ scheme: 'category10' }} nodeOpacity={1} nodeThickness={18} nodeBorderWidth={0} nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }} linkOpacity={0.5} linkHoverOthersOpacity={0.2} enableLinkGradient={true} labelPosition="outside" labelOrientation="vertical" labelPadding={16} labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }} animate={true} />
                ) : (
                  <div className="h-full flex items-center justify-center"><p className="text-muted-foreground">表示するデータがありません。</p></div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tax">
           <div className="mt-4">
            <TaxReport transactions={filteredTransactions} />
           </div>
        </TabsContent>
        <TabsContent value="contribution">
           <div className="mt-4">
            <ContributionTracker accounts={accounts} transactions={filteredTransactions} />
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
