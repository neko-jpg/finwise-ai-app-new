'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Transaction } from "@/lib/domain";
import { TAX_TAGS } from '@/data/dummy-data';

interface TaxReportProps {
  transactions: Transaction[];
}

export function TaxReport({ transactions }: TaxReportProps) {
  const reportData = useMemo(() => {
    const taggedTransactions = transactions.filter(t => t.taxTag);

    const summary = taggedTransactions.reduce((acc, t) => {
      if (t.taxTag) {
        if (!acc[t.taxTag]) {
          acc[t.taxTag] = { total: 0, label: TAX_TAGS.find(tag => tag.key === t.taxTag)?.label || t.taxTag };
        }
        acc[t.taxTag].total += t.amount;
      }
      return acc;
    }, {} as { [key: string]: { total: number, label: string } });

    return Object.entries(summary).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>税務レポート</CardTitle>
        <CardDescription>
          選択された期間における、税金関連のタグが付いた取引の概要です。確定申告の参考資料としてご利用ください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>控除項目</TableHead>
              <TableHead className="text-right">合計金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.length > 0 ? (
              reportData.map(item => (
                <TableRow key={item.key}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell className="text-right font-mono">¥{Math.abs(item.total).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  対象となる取引はありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
