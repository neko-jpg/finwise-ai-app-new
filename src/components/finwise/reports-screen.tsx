'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSankey } from '@nivo/sankey';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxReport } from './tax-report';
import { ContributionTracker } from './contribution-tracker'; // Import the new component
import type { User } from 'firebase/auth';
import type { Transaction, Account } from '@/lib/types';
import { CATEGORIES } from '@/data/dummy-data';

interface ReportsScreenProps {
  user?: User;
  transactions: Transaction[];
  accounts: Account[]; // Accept the new prop
  loading?: boolean;
}

export function ReportsScreen({ user, transactions, accounts, loading }: ReportsScreenProps) {
  const sankeyData = useMemo(() => {
    // ... (sankey logic remains the same)
    if (!transactions || transactions.length === 0) return { nodes: [], links: [] };
    const nodes: { id: string }[] = [];
    const links: { source: string; target: string; value: number }[] = [];
    const incomeNode = { id: '収入' };
    const expenseRootNode = { id: '支出' };
    nodes.push(incomeNode);
    nodes.push(expenseRootNode);
    let totalIncome = 0;
    const expensesByCategory: { [key: string]: number } = {};
    for (const t of transactions) {
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
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline">レポート</h2>
        <p className="text-muted-foreground">お金の流れを視覚的に分析しましょう。</p>
      </div>

      <Tabs defaultValue="sankey" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sankey">月次フロー</TabsTrigger>
          <TabsTrigger value="tax">税務レポート</TabsTrigger>
          <TabsTrigger value="contribution">拠出額</TabsTrigger>
        </TabsList>
        <TabsContent value="sankey">
          <Card className="mt-4">
            <CardHeader><CardTitle>月次レポート (Sankey図)</CardTitle><CardDescription>収入がどのように支出に流れているかを確認します。</CardDescription></CardHeader>
            <CardContent>
              <div style={{ height: 400 }} className="bg-muted rounded-lg">
                {sankeyData.nodes.length > 0 ? (
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
            <TaxReport transactions={transactions} year={new Date().getFullYear()} />
           </div>
        </TabsContent>
        <TabsContent value="contribution">
           <div className="mt-4">
            <ContributionTracker accounts={accounts} transactions={transactions} />
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
