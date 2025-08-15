'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction } from "@/lib/types";
import { TAX_TAGS } from '@/data/dummy-data';

interface TaxReportProps {
  transactions: Transaction[];
  initialYear: number;
}

export function TaxReport({ transactions, initialYear }: TaxReportProps) {
  const [year, setYear] = useState(initialYear);

  const reportData = useMemo(() => {
    const taggedTransactions = transactions.filter(
      t => t.taxTag && new Date(t.bookedAt).getFullYear() === year
    );

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
  }, [transactions, year]);

  const yearOptions = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>{year}年 税務レポート</CardTitle>
            <CardDescription className="mt-1">
                税金関連のタグが付いた取引の概要です。
            </CardDescription>
        </div>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="年を選択" />
            </SelectTrigger>
            <SelectContent>
                {yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}年</SelectItem>)}
            </SelectContent>
        </Select>
        <CardDescription>
          税金関連のタグが付いた取引の概要です。確定申告の参考資料としてご利用ください。
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
                  この年には対象となる取引がありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
