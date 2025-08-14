
'use client';
import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Sparkles, Loader } from "lucide-react";
import { CATEGORIES } from "@/data/dummy-data";
import { analyzeSpending } from '@/ai/flows/spending-insights';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { useTranslations } from 'next-intl';

interface TransactionsScreenProps {
  q: string;
  setQ: (q: string) => void;
  filteredTx: Transaction[];
  catFilter: string | null;
  setCatFilter: (cat: string | null) => void;
  loading: boolean;
  transactions: Transaction[];
}

export function TransactionsScreen({ q, setQ, filteredTx, catFilter, setCatFilter, loading, transactions }: TransactionsScreenProps) {
  const t = useTranslations('TransactionsScreen');
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (filteredTx.length === 0) {
        toast({
            title: "データがありません",
            description: "分析するには、まず取引をいくつか登録してください。",
            variant: "destructive"
        });
        return;
    }
    startTransition();
    analyzeSpending({ transactions: filteredTx.map(t => ({...t, bookedAt: t.bookedAt.toISOString()})) })
      .then(result => {
        toast({
          title: "AIによる支出のインサイト",
          description: result.insights,
        });
      })
      .catch(e => {
        console.error(e);
        toast({
          title: "エラー",
          description: "分析に失敗しました。",
          variant: "destructive",
        });
      })
  };
  
  const renderList = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12 ml-auto" />
          </div>
        </div>
      ));
    }

    if (filteredTx.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t('no_transactions')}</p>
        </div>
      );
    }
    
    return filteredTx.map((t: Transaction) => (
      <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-full">
            {CATEGORIES.find(c => c.key === t.category.major)?.icon || <div className="h-4 w-4"/>}
          </div>
          <div>
              <div className="font-medium">{t.merchant}</div>
              <div className="text-xs text-muted-foreground">{t.bookedAt ? format(t.bookedAt, 'yyyy-MM-dd') : ''}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold font-mono ${t.amount < 0 ? 'text-foreground' : 'text-green-600'}`}>
              {t.amount < 0 ? "-" : "+"}¥{Math.abs(t.amount).toLocaleString()}
          </div>
          <Badge variant="outline" className="mt-1 font-normal">
              {CATEGORIES.find(c => c.key === t.category.major)?.label || t.category.major}
          </Badge>
        </div>
      </div>
    ));
  };


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-xl">{t('title')}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isPending || loading}>
                    {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {t('analyze_with_ai')}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_placeholder')} className="pl-9" />
                </div>
                <Sheet open={isFilterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">{t('filter_alt')}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle className="font-headline">{t('filter_title')}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                    {CATEGORIES.map(c => (
                        <Button
                            key={c.key}
                            variant={catFilter === c.key ? "default" : "secondary"}
                            onClick={() => {
                                setCatFilter(catFilter === c.key ? null : c.key);
                                setFilterSheetOpen(false);
                            }}
                            className="justify-start gap-2"
                        >
                        {c.icon}
                        {c.label}
                        </Button>
                    ))}
                     <Button
                        variant={!catFilter ? "default" : "secondary"}
                        onClick={() => {
                            setCatFilter(null);
                            setFilterSheetOpen(false);
                        }}
                        className="col-span-2"
                        >
                        {t('all_categories')}
                    </Button>
                    </div>
                </SheetContent>
                </Sheet>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100dvh-22rem)]">
            <div className="divide-y">
              {renderList()}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
