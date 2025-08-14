

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, CheckCircle, Rocket, Loader } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { reviewFixedCosts, ReviewFixedCostsOutput } from '@/ai/flows/review-fixed-costs';
import type { Transaction } from '@/lib/types';
import { AppContainer } from '@/components/finwise/app-container';

interface ReviewsScreenProps {
    transactions: Transaction[];
}

const convertTimestampsInObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(convertTimestampsInObject);

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            newObj[key] = convertTimestampsInObject(value);
        }
    }
    return newObj;
};

export function ReviewsScreen({ transactions }: ReviewsScreenProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [review, setReview] = useState<ReviewFixedCostsOutput | null>(null);

    useEffect(() => {
        if (transactions.length > 0) {
            startTransition(async () => {
                try {
                    const result = await reviewFixedCosts({
                        transactions: convertTimestampsInObject(transactions)
                    });
                    setReview(result);
                } catch (e) {
                    console.error("Fixed cost review failed", e);
                    toast({
                        variant: "destructive",
                        title: "レビューの生成に失敗しました",
                        description: "AIによる分析中にエラーが発生しました。時間をおいて再度お試しください。",
                    });
                }
            });
        }
    }, [transactions, toast]);

    const renderContent = () => {
        if (isPending || !review) {
            return (
                <>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-primary">AIからの推奨アクション</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>固定費の変化（今週）</CardTitle>
                            <CardDescription>先週と比較した固定費の変動一覧です。</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>項目</TableHead>
                                        <TableHead className="text-right">先月</TableHead>
                                        <TableHead className="text-right">今月</TableHead>
                                        <TableHead className="text-right">変化</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            );
        }
        
        if (review.changes.length === 0 && review.recommendations.length === 0) {
            return (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Rocket className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-bold">分析データが不足しています</h3>
                        <p className="text-sm mt-1">固定費（光熱費・家賃など）の取引をいくつか登録すると、AIが変動をレビューします。</p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-primary">AIからの推奨アクション</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {review.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 mt-1 text-primary/80" />
                                <div>
                                    <p>{rec}</p>
                                    <Button variant="link" className="p-0 h-auto">詳細を見て対応する</Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>固定費の変化（今週）</CardTitle>
                        <CardDescription>先週と比較した固定費の変動一覧です。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>項目</TableHead>
                                    <TableHead className="text-right">先月</TableHead>
                                    <TableHead className="text-right">今月</TableHead>
                                    <TableHead className="text-right">変化</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {review.changes.map((c, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{c.merchant}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">¥{c.prev.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">¥{c.curr.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            {c.deltaPct > 0 ? (
                                                <span className="flex items-center justify-end gap-1 text-red-500 font-semibold">
                                                    <ArrowUp className="h-4 w-4" /> +{c.deltaPct.toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-end gap-1 text-green-500 font-semibold">
                                                    <ArrowDown className="h-4 w-4" /> {c.deltaPct.toFixed(1)}%
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </>
        );
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline flex items-center justify-center gap-2"><Rocket />毎週の固定費レビュー</h2>
                <p className="text-muted-foreground">AIが固定費の変化を検知し、節約アクションを提案します。</p>
            </div>
            {renderContent()}
        </div>
    );
}

export default function ReviewsPage() {
    return (
        <AppContainer>
            <ReviewsScreen transactions={[]} />
        </AppContainer>
    );
}
