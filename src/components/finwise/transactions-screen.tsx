
'use client';
import { useState, useTransition, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Sparkles, Loader, Trash2, Undo2 } from "lucide-react";
import { CATEGORIES } from "@/data/dummy-data";
import { analyzeSpending } from '@/ai/flows/spending-insights';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

interface TransactionsScreenProps {
  loading?: boolean;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  user?: User;
}

export function TransactionsScreen({ loading, transactions = [], setTransactions, user }: TransactionsScreenProps) {
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const filteredTx = useMemo(() => {
    return transactions.filter((t: Transaction) => 
      (showDeleted ? t.deletedAt : !t.deletedAt) &&
      (catFilter ? t.category.major === catFilter : true) && 
      (q ? t.merchant.toLowerCase().includes(q.toLowerCase()) : true)
    );
  }, [transactions, catFilter, q, showDeleted]);

  const handleAnalyze = () => {
    const txToAnalyze = filteredTx.map(t => ({...t, bookedAt: t.bookedAt.toISOString(), createdAt: t.createdAt.toDate().toISOString(), updatedAt: t.updatedAt.toDate().toISOString()}));

    if (txToAnalyze.length === 0) {
        toast({
            title: "データがありません",
            description: "分析するには、まず取引をいくつか登録してください。",
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      try {
        const result = await analyzeSpending({ transactions: txToAnalyze });
        toast({
          title: "AIによる支出のインサイト",
          description: result.insights,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "エラー",
          description: "分析に失敗しました。",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleDelete = async (txId: string, isDeleted: boolean) => {
    if (!user) return;
    
    // Optimistic Update
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, deletedAt: isDeleted ? null : new Date() } : t));

    const docRef = doc(db, `users/${user.uid}/transactions`, txId);
    try {
      await updateDoc(docRef, {
        deletedAt: isDeleted ? null : serverTimestamp()
      });
      toast({
        title: isDeleted ? "取引を復元しました" : "取引を削除しました",
        description: isDeleted ? "" : "「削除済み」から復元できます。",
      });
    } catch (e) {
      console.error(e);
      // Revert optimistic update on failure
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, deletedAt: isDeleted ? new Date() : null } : t));
      toast({ variant: "destructive", title: "更新に失敗しました"});
    }
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
          <p>{showDeleted ? "削除済みの取引はありません。" : "取引が見つかりません。"}</p>
        </div>
      );
    }
    
    return filteredTx.map((t: Transaction) => (
      <div key={t.id} className="group flex items-center justify-between p-4 hover:bg-muted/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-full">
            {CATEGORIES.find(c => c.key === t.category.major)?.icon || <div className="h-4 w-4"/>}
          </div>
          <div>
              <div className="font-medium">{t.merchant}</div>
              <div className="text-xs text-muted-foreground">{t.bookedAt ? format(t.bookedAt, 'yyyy-MM-dd') : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`font-bold font-mono ${t.amount < 0 ? 'text-foreground' : 'text-green-600'}`}>
                {t.amount < 0 ? "-" : "+"}¥{Math.abs(t.amount).toLocaleString()}
            </div>
            <Badge variant="outline" className="mt-1 font-normal">
                {CATEGORIES.find(c => c.key === t.category.major)?.label || t.category.major}
            </Badge>
          </div>
           {showDeleted ? (
              <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleToggleDelete(t.id, true)}><Undo2 className="h-4 w-4" /></Button>
            ) : (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleToggleDelete(t.id, false)}><Trash2 className="h-4 w-4" /></Button>
            )}
        </div>
      </div>
    ));
  };


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-xl">取引明細</CardTitle>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="sm" onClick={() => setShowDeleted(!showDeleted)}>
                    {showDeleted ? "一覧に戻る" : "削除済みを表示"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isPending || loading}>
                      {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      AIで分析
                  </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="店名・メモ・金額で検索..." className="pl-9" />
                </div>
                <Sheet open={isFilterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">フィルタ</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle className="font-headline">カテゴリで絞り込み</SheetTitle>
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
                        すべてのカテゴリ
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
