
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, ChevronRight, RefreshCw, Trash2 } from "lucide-react";

const dummySubscriptions = [
    { name: "Netflix", amount: 1490, interval: "月次", wasteScore: 0.8, nextDate: "2025-09-10" },
    { name: "Spotify", amount: 980, interval: "月次", wasteScore: 0.2, nextDate: "2025-09-15" },
    { name: "Adobe Creative Cloud", amount: 6480, interval: "月次", wasteScore: 0.9, nextDate: "2025-09-01" },
    { name: "AWS", amount: 2345, interval: "月次", wasteScore: 0.1, nextDate: "2025-09-20" },
];

export function SubscriptionsScreen() {
    return (
        <div className="space-y-6">
             <div className="text-center">
                <h2 className="text-2xl font-bold font-headline flex items-center justify-center gap-2"><Bell />無駄サブスク検知</h2>
                <p className="text-muted-foreground">定期的な支出をAIが自動検出し、解約候補を提案します。</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>検出されたサブスクリプション</CardTitle>
                    <CardDescription>AIがあなたの取引履歴から定期的な支払いと判断した項目です。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {dummySubscriptions.sort((a,b) => b.wasteScore - a.wasteScore).map((sub, i) => (
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

            <div className="flex justify-center gap-2">
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
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
