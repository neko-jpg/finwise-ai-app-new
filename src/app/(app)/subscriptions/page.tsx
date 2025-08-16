'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, RefreshCw, Loader, Tags, ArrowRight } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { scanAndTagSubscriptions } from '@/app/actions';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

interface SubscriptionsScreenProps {
    transactions: Transaction[];
    familyId: string;
}

interface SubscriptionGroup {
    name: string;
    count: number;
    totalAmount: number;
    lastPaymentDate: Date;
    transactionIds: string[];
}

export function SubscriptionsScreen({ transactions, familyId }: SubscriptionsScreenProps) {
    const [isScanning, startScanTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const subscriptions = useMemo(() => {
        if (!transactions) return [];
        const taggedTransactions = transactions.filter(t => t.tags?.includes('subscription'));

        const groups = taggedTransactions.reduce((acc, tx) => {
            const merchant = tx.merchant || '不明な店舗';
            if (!acc[merchant]) {
                acc[merchant] = {
                    name: merchant,
                    count: 0,
                    totalAmount: 0,
                    lastPaymentDate: tx.bookedAt,
                    transactionIds: [],
                };
            }
            acc[merchant].count++;
            acc[merchant].totalAmount += tx.amount;
            if (tx.bookedAt > acc[merchant].lastPaymentDate) {
                acc[merchant].lastPaymentDate = tx.bookedAt;
            }
            acc[merchant].transactionIds.push(tx.id);
            return acc;
        }, {} as Record<string, SubscriptionGroup>);

        return Object.values(groups).sort((a, b) => b.lastPaymentDate.getTime() - a.lastPaymentDate.getTime());
    }, [transactions]);

    const handleScan = async () => {
        if (!familyId) {
            toast({
                variant: "destructive",
                title: "エラー",
                description: "スキャンを開始できませんでした。ファミリーIDが見つかりません。",
            });
            return;
        }
        startScanTransition(async () => {
            const result = await scanAndTagSubscriptions(familyId);
            if (result.success) {
                toast({
                    title: "スキャン完了",
                    description: `${result.taggedCount || 0}件の取引に「サブスクリプション」タグが付きました。`,
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "スキャン失敗",
                    description: result.error || "AIによる分析中にエラーが発生しました。",
                });
            }
        });
    };

    const renderContent = () => {
        if (!transactions) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>検出されたサブスクリプション</CardTitle>
                        <CardDescription>「サブスクリプション」タグが付いた取引を店舗ごとにまとめて表示しています。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({length: 3}).map((_, i) => (
                           <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </CardContent>
                </Card>
            );
        }
        
        if (subscriptions.length === 0) {
            return (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-bold">サブスクリプションが見つかりません</h3>
                        <p className="text-sm mt-1">下のボタンからスキャンを実行して、取引履歴から定期的な支払いを探しましょう。</p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>検出されたサブスクリプション</CardTitle>
                    <CardDescription>「サブスクリプション」タグが付いた取引を店舗ごとにまとめて表示しています。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {subscriptions.map((sub) => (
                        <Card key={sub.name} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold text-lg">{sub.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {sub.count}件の支払い | 合計: {Math.abs(sub.totalAmount).toLocaleString()}円
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    最終支払日: {format(new Date(sub.lastPaymentDate), 'yyyy/MM/dd')}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                               <a href={`/app/transactions?q=${encodeURIComponent(sub.name)}`}>
                                    詳細を見る <ArrowRight className="h-4 w-4 ml-2" />
                               </a>
                            </Button>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
             <div className="text-center">
                <h2 className="text-2xl font-bold font-headline flex items-center justify-center gap-2"><Tags />サブスクリプション管理</h2>
                <p className="text-muted-foreground">取引履歴から定期的な支払いを自動で検出し、タグ付けします。</p>
            </div>
            
            {renderContent()}

            <div className="flex justify-center gap-2 mt-6">
                <Button onClick={handleScan} disabled={isScanning}>
                    {isScanning ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {subscriptions.length > 0 ? '再スキャンを実行' : 'サブスクリプションをスキャン'}
                </Button>
            </div>
        </div>
    );
}

export default function SubscriptionsPage(props: any) {
    // This page now needs familyId, which should be passed from the layout.
    // The AppContainer will pass it down to its children.
    return <SubscriptionsScreen {...props} />;
}
