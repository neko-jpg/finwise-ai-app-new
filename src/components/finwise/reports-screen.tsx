'use client';

import { useState, useMemo, useTransition } from 'react';
import { DateRange } from "react-day-picker"
import { startOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveSankey } from '@nivo/sankey';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { generateWeeklySummary } from '@/ai/flows/generate-weekly-summary';
import { useToast } from '@/hooks/use-toast';
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
  const [isGenerating, startGeneration] = useTransition();
  const [summary, setSummary] = useState<any>(null);
  const { toast } = useToast();
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>(new Date().getFullYear().toString());

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

  const handleGenerateSummary = () => {
    const today = new Date();
    const from = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const to = endOfWeek(today, { weekStartsOn: 1 });

    const weeklyTx = transactions.filter(t => {
        const txDate = new Date(t.bookedAt);
        return txDate >= from && txDate <= to;
    });

    if (weeklyTx.length === 0) {
        toast({ title: "データ不足", description: "今週の取引データがありません。", variant: "destructive"});
        return;
    }

    startGeneration(async () => {
        try {
            const result = await generateWeeklySummary({ transactions: weeklyTx });
            setSummary(result);
        } catch (e: any) {
            toast({ title: "エラー", description: e.message, variant: "destructive"});
        }
    });
  };

      <Tabs defaultValue="sankey" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sankey">月次フロー</TabsTrigger>
          <TabsTrigger value="summary">週次サマリー</TabsTrigger>
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
        <TabsContent value="summary">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>AI週次サマリー</CardTitle>
                    <CardDescription>AIが今週のあなたの支出を分析し、簡単なレポートを作成します。</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                        {isGenerating ? <Loader className="animate-spin mr-2" /> : null}
                        今週のサマリーを生成
                    </Button>

                    {isGenerating && <p className="text-sm text-muted-foreground mt-2">AIが分析中です...</p>}

                    {summary && !isGenerating && (
                        <div className="mt-6 text-left space-y-4 animate-in fade-in-50">
                            <p className="text-lg text-center p-4 bg-muted rounded-lg">"{summary.positiveInsight}"</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" /> 今週のMVPカテゴリ</CardTitle>
                                    </CardHeader>
                                    <CardContent><p className="text-2xl font-bold">{summary.mvpCategory}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-red-500" /> 最大支出カテゴリ</CardTitle>
                                    </CardHeader>
                                    <CardContent><p className="text-2xl font-bold">{summary.highestSpendingCategory}</p></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> 要注意サブスク</CardTitle>
                                    </CardHeader>
                                    <CardContent><p className="text-2xl font-bold">{summary.subscriptionToWatch || 'なし'}</p></CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="tax">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>確定申告用レポート</CardTitle>
                    <CardDescription>対象年を選択して、医療費控除などの対象となる取引をまとめたPDFをエクスポートします。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Select value={selectedTaxYear} onValueChange={setSelectedTaxYear}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="対象年を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* Generate last 5 years */}
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}年</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => {
                            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
                            if (!projectId) {
                                toast({ title: "エラー", description: "プロジェクトIDが設定されていません。", variant: "destructive"});
                                return;
                            }
                            // Assuming us-central1, which is common for Firebase Functions
                            const url = `https://us-central1-${projectId}.cloudfunctions.net/exportTaxReport?year=${selectedTaxYear}`;
                            window.open(url, '_blank');
                        }}>
                            PDFをエクスポート
                        </Button>
                    </div>
                    <div className="mt-6">
                        <h4 className="font-medium mb-2">レポートプレビュー</h4>
                        <div className="p-4 border rounded-lg bg-muted min-h-[200px]">
                             <TaxReport transactions={filteredTransactions.filter(t => new Date(t.bookedAt).getFullYear().toString() === selectedTaxYear)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
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
