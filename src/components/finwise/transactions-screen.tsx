
'use client';
import { useState, useTransition, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Sparkles, Loader, Trash2, Undo2, AlertCircle, FilePlus2, RefreshCw } from "lucide-react";
import { CATEGORIES, TAX_TAGS } from "@/data/dummy-data";
import { analyzeSpending } from '@/ai/flows/spending-insights';
import { detectDuplicates, DetectDuplicatesOutput } from '@/ai/flows/detect-duplicates';
import { syncAllTransactions } from '@/ai/flows/plaid-flows';
import { useToast, showErrorToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { DuplicateReviewCard } from './DuplicateReviewCard';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from 'firebase/auth';

interface TransactionsScreenProps {
  loading?: boolean;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  user?: User;
  familyId?: string;
  onOpenTransactionForm?: () => void;
}

export function TransactionsScreen({ loading, transactions = [], setTransactions, user, familyId, onOpenTransactionForm = () => {} }: TransactionsScreenProps) {
  const [q, setQ] = useState("");
  const [scopeFilter, setScopeFilter] = useState<'all' | 'shared' | 'personal'>('all');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [aiMessage, setAiMessage] = useState('AIで分析');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [potentialDuplicates, setPotentialDuplicates] = useState<DetectDuplicatesOutput['potentialDuplicates']>([]);
  const { toast } = useToast();

  const filteredTx = useMemo(() => {
    return transactions.filter((t: Transaction) => {
      const scopeMatch = scopeFilter === 'all'
        || (scopeFilter === 'shared' && t.scope === 'shared')
        || (scopeFilter === 'personal' && t.scope === 'personal' && t.createdBy === user?.uid);

      return (showDeleted ? t.deletedAt : !t.deletedAt) &&
        (catFilter ? t.category.major === catFilter : true) &&
        (q ? t.merchant.toLowerCase().includes(q.toLowerCase()) : true) &&
        scopeMatch;
    });
  }, [transactions, catFilter, q, showDeleted, scopeFilter, user?.uid]);

  const aiAnalyzeMessages = [
    "AIが分析中...",
    "取引データを集計しています...",
    "支出の傾向を特定中...",
    "インサイトを生成しています...",
  ];

  useEffect(() => {
    if (isPending) {
        let index = 0;
        setAiMessage(aiAnalyzeMessages[0]);
        const interval = setInterval(() => {
            index = (index + 1) % aiAnalyzeMessages.length;
            setAiMessage(aiAnalyzeMessages[index]);
        }, 2000);
        return () => clearInterval(interval);
    } else {
        setAiMessage('AIで分析');
    }
  }, [isPending]);

  const handleSyncTransactions = async () => {
    if (!user) return;
    setIsSyncing(true);
    toast({ title: "取引の同期を開始します...", description: "連携済み口座から最新の取引を取得します。" });
    try {
        if (!familyId) {
            showErrorToast(new Error("Family IDが見つかりません。"));
            return;
        }

        const result = await syncAllTransactions({ familyId });
        toast({ title: "同期が完了しました", description: `${result.syncedItems}件の口座を同期しました。` });
    } catch (e: any) {
        showErrorToast(new Error("取引の同期に失敗しました。"));
        console.error(e);
    } finally {
        setIsSyncing(false);
    }
  };

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
        showErrorToast(new Error("分析中にエラーが発生しました。"));
      }
    });
  };

  const handleDetectDuplicates = async () => {
    setIsDetecting(true);
    setPotentialDuplicates([]);
    try {
      const transactionsForAI = transactions
        .filter(t => !t.deletedAt)
        .map(t => ({
          id: t.id,
          merchant: t.merchant,
          amount: t.amount,
          bookedAt: t.bookedAt.toISOString(),
        }));

      if (transactionsForAI.length < 2) {
        toast({ title: "取引が少なすぎます", description: "重複チェックには、少なくとも2つの取引が必要です。" });
        return;
      }

      const result = await detectDuplicates({ transactions: transactionsForAI });

      if (result.potentialDuplicates.length === 0) {
        toast({ title: "重複は見つかりませんでした", description: "システムがチェックしましたが、重複の可能性が高い取引はありませんでした。" });
      } else {
        setPotentialDuplicates(result.potentialDuplicates);
        toast({
          title: `${result.potentialDuplicates.length}件の重複の可能性があります`,
          description: "以下のカードを確認し、取引を統合するかどうかを判断してください。",
        });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "重複チェックに失敗しました" });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleToggleDelete = async (txId: string, isDeleted: boolean) => {
    if (!user) return;
    
    // Optimistic Update
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, deletedAt: isDeleted ? null : Timestamp.fromDate(new Date()) } : t));

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
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, deletedAt: isDeleted ? Timestamp.fromDate(new Date()) : null } : t));
      toast({ variant: "destructive", title: "更新に失敗しました"});
    }
  };
  
  const handleMerge = async (winnerId: string, loserId: string) => {
    if (!user) return;

    // For V1, merging is simply soft-deleting the "loser" transaction.
    // A more advanced implementation could merge details from the loser into the winner.

    // We can reuse the handleToggleDelete logic, but we need to call it directly
    // to avoid optimistic UI issues when merging multiple items.
    const docRef = doc(db, `users/${user.uid}/transactions`, loserId);
    try {
      await updateDoc(docRef, {
        deletedAt: serverTimestamp()
      });

      // Update local state by removing the loser
      setTransactions(prev => prev.filter(t => t.id !== loserId));

      toast({
        title: "取引を統合しました",
        description: `取引 ${loserId.substring(0, 6)} は削除済みとしてマークされました。`,
      });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "統合に失敗しました"});
      // Don't revert UI state here as it could be complex if multiple merges are happening.
      // A full refresh might be a safer, albeit less ideal, recovery strategy.
    }

    // Finally, dismiss the card from the review UI
    handleDismiss(winnerId, loserId);
  };

  const handleDismiss = (tx1Id: string, tx2Id: string) => {
    setPotentialDuplicates(prev => prev.filter(p =>
        !((p.tx1_id === tx1Id && p.tx2_id === tx2Id) || (p.tx1_id === tx2Id && p.tx2_id === tx1Id))
    ));
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
      // Only show the big empty state if there are NO transactions at all and no filters are active.
      if (transactions.length === 0 && !q && !catFilter) {
        return (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg m-4">
                <FilePlus2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-bold text-lg">最初の取引を追加しましょう</h3>
                <p className="text-sm mt-2 mb-4">レシートを撮影するか、手動で入力して家計管理を始めましょう。</p>
                 <Button onClick={onOpenTransactionForm} size="lg">取引を追加する</Button>
            </div>
        )
      }
      // Otherwise, show a simpler "not found" message.
      return (
        <div className="text-center py-16 text-muted-foreground">
          <p>{showDeleted ? "削除済みの取引はありません。" : "該当する取引が見つかりません。"}</p>
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
              <div className="font-medium flex items-center gap-2">
                {t.merchant}
                {t.scope === 'personal' && <Badge variant="secondary">個人</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">{t.bookedAt ? format(t.bookedAt, 'yyyy-MM-dd') : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`font-bold font-mono ${t.originalAmount < 0 ? 'text-foreground' : 'text-green-600'}`}>
                {t.originalAmount < 0 ? "-" : "+"}{Math.abs(t.originalAmount).toLocaleString()}
                <span className="text-xs ml-1">{t.originalCurrency}</span>
            </div>
            {t.originalCurrency !== 'JPY' && (
                <div className="text-xs text-muted-foreground font-mono">
                    (約 ¥{Math.abs(Math.round(t.amount)).toLocaleString()})
                </div>
            )}
            <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="font-normal">
                    {CATEGORIES.find(c => c.key === t.category.major)?.label || t.category.major}
                </Badge>
                {t.taxTag && (
                    <Badge variant="destructive" className="font-normal">
                        {TAX_TAGS.find(tag => tag.key === t.taxTag)?.label || t.taxTag}
                    </Badge>
                )}
            </div>
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
                   <Button variant="secondary" size="sm" onClick={handleSyncTransactions} disabled={isSyncing || loading}>
                      {isSyncing ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      同期
                  </Button>
                   <Button variant="ghost" size="sm" onClick={() => setShowDeleted(!showDeleted)}>
                    {showDeleted ? "一覧に戻る" : "削除済みを表示"}
                  </Button>
                   <Button variant="outline" size="sm" onClick={handleDetectDuplicates} disabled={isDetecting || loading}>
                      {isDetecting ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                      重複をチェック
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isPending || loading}>
                      {isPending ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {isPending ? aiMessage : "AIで分析"}
                  </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs value={scopeFilter} onValueChange={(v) => setScopeFilter(v as any)} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="shared">共有</TabsTrigger>
                <TabsTrigger value="personal">個人</TabsTrigger>
              </TabsList>
            </Tabs>
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
      
      {potentialDuplicates.length > 0 && (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">重複の可能性がある取引の確認</h3>
            {potentialDuplicates.map((p) => {
                const tx1 = transactions.find(t => t.id === p.tx1_id);
                const tx2 = transactions.find(t => t.id === p.tx2_id);
                if (!tx1 || !tx2) return null;
                return (
                    <DuplicateReviewCard
                        key={`${p.tx1_id}-${p.tx2_id}`}
                        tx1={tx1}
                        tx2={tx2}
                        reason={p.reason}
                        onMerge={handleMerge}
                        onDismiss={handleDismiss}
                    />
                );
            })}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100dvh-32rem)]">
            <div className="divide-y">
              {renderList()}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
