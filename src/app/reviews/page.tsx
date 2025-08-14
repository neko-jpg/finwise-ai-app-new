
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, CheckCircle, Rocket } from "lucide-react";

const dummyChanges = [
    { merchant: "Netflix", prev: 1490, curr: 1790, deltaPct: 20.1 },
    { merchant: "電気料金", prev: 4200, curr: 4850, deltaPct: 15.5 },
    { merchant: "携帯電話料金", prev: 2980, curr: 2980, deltaPct: 0 },
    { merchant: "家賃", prev: 85000, curr: 85000, deltaPct: 0 },
];

const dummyRecommendations = [
    "Netflixのプランが値上がりしています。ベーシックプランへの変更で月300円節約できます。",
    "電気料金が平均より高めです。電力会社の乗り換えシミュレーションをおすすめします。",
];

export function ReviewsScreen() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold font-headline flex items-center justify-center gap-2"><Rocket />毎週の固定費レビュー</h2>
                <p className="text-muted-foreground">AIが固定費の変化を検知し、節約アクションを提案します。</p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-primary">AIからの推奨アクション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dummyRecommendations.map((rec, i) => (
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
                                <TableHead className="text-right">先週</TableHead>
                                <TableHead className="text-right">今週</TableHead>
                                <TableHead className="text-right">変化</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyChanges.map((c, i) => (
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
        </div>
    );
}
