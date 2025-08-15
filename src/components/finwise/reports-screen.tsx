'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSankey } from '@nivo/sankey';
import { useTransactions } from '@/hooks/use-transactions';
import type { User } from 'firebase/auth';
import type { Transaction } from '@/lib/types';
import { CATEGORIES } from '@/data/dummy-data';

interface SankeyData {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
}

interface ReportsScreenProps {
  user?: User;
  transactions: Transaction[];
  loading?: boolean;
}

export function ReportsScreen({ user, transactions, loading }: ReportsScreenProps) {
  const sankeyData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { nodes: [], links: [] };
    }

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
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += Math.abs(t.amount);
      }
    }

    if (totalIncome > 0) {
        links.push({ source: incomeNode.id, target: expenseRootNode.id, value: totalIncome });
    }

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

      <Card>
        <CardHeader>
          <CardTitle>月次レポート (Sankey図)</CardTitle>
          <CardDescription>
            収入がどのように支出に流れているかを確認します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 400 }} className="bg-muted rounded-lg">
            {sankeyData.nodes.length > 0 ? (
              <ResponsiveSankey
                data={sankeyData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                align="justify"
                colors={{ scheme: 'category10' }}
                nodeOpacity={1}
                nodeThickness={18}
                nodeBorderWidth={0}
                nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
                linkOpacity={0.5}
                linkHoverOthersOpacity={0.2}
                enableLinkGradient={true}
                labelPosition="outside"
                labelOrientation="vertical"
                labelPadding={16}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                animate={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">表示するデータがありません。取引を登録してください。</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
