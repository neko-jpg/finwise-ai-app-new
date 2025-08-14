
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, ChevronRight, RefreshCw, Trash2, Loader } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { detectSubscriptions, DetectSubscriptionsOutput } from '@/ai/flows/detect-subscriptions';
import type { Transaction } from '@/lib/types';


interface SubscriptionsScreenProps {
    transactions: Transaction[];
}

export function SubscriptionsScreen({ transactions }: SubscriptionsScreenProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [subs, setSubs] = useState<DetectSubscriptionsOutput['subscriptions'] | null>(null);

     const fetchSubscriptions = () => {
        if (transactions.length > 0) {
            startTransition(async () => {
                try {
                    const result = await detectSubscriptions({
                        transactions: transactions.map(t => ({...t, bookedAt: t.bookedAt.toISOString()}))
                    });
                    setSubs(result.subscriptions);
                } catch (e) {
                    console.error("Subscription detection failed", e);
                    toast({
                        variant: "destructive",
                        title: "サブスクリプションの検出に失敗しました",
                        description: "AIによる分析中にエラーが発生しました。時間をおいて再度お試しください。",
                    });
                }
            });
        }
    };
    
    useEffect(() => {
        fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions, toast]);

    const renderContent = () => {
        if (isPending || !subs) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>検出されたサブスクリプション</CardTitle>
                        <CardDescription>AIがあなたの取引履歴から定期的な支払いと判断した項目です。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({length: 3}).map((_, i) => (
                           <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </CardContent>
                </Card>
            );
        }
        
        if (subs.length === 0) {
            return (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-bold">サブスクリプションが見つかりません</h3>
                        <p className="text-sm mt-1">取引データを登録すると、AIが定期的な支払いを自動で検出します。</p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>検出されたサブスクリプション</CardTitle>
                    <CardDescription>AIがあなたの取引履歴から定期的な支払いと判断した項目です。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {subs.sort((a,b) => b.wasteScore - a.wasteScore).map((sub, i) => (
                        <Card key={i} className={`p-4 flex flex-col md:flex-row md:items-center gap-4 ${sub.wasteScore > 0.7 ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
                           {sub.wasteScore > 0.7 && (
                             <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 shrink-0">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-bold">解約候補</span>
                            </div>
                           )}
                            <div className="flex-grow">
                                <p className="font-semibold">{sub.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    約 {sub.amount.toLocaleString()}円 / {sub.interval}
                                    <span className="mx-2">|</span>
                                    次回支払見込: {sub.nextDate}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-end">
                                <Button variant="ghost" size="sm">理由を見る</Button>
                                <Button variant="destructive" size="sm" className="gap-1">
                                    解約する
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
             <div className="text-center">
                <h2 className="text-2xl font-bold font-headline flex items-center justify-center gap-2"><Bell />無駄サブスク検知</h2>
                <p className="text-muted-foreground">定期的な支出をAIが自動検出し、解約候補を提案します。</p>
            </div>
            
            {renderContent()}

            <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={fetchSubscriptions} disabled={isPending}>
                    {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    再スキャンを実行
                </Button>
                <Button variant="secondary">
                     <Trash2 className="mr-2 h-4 w-4" />
                    無視した項目を管理
                </Button>
            </div>
        </div>
    );
}
