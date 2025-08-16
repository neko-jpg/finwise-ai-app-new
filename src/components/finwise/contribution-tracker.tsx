'use client';

import { useContributionTracker } from '@/hooks/use-contribution-tracker';
import type { Account } from '@/lib/domain';
import type { Transaction } from '@/lib/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

interface ContributionTrackerProps {
    accounts: Account[];
    transactions: Transaction[];
}

export function ContributionTracker({ accounts, transactions }: ContributionTrackerProps) {
    const currentYear = new Date().getFullYear();
    const {
        totalContribution,
        contributionLimit,
        contributingTransactions,
        retirementAccounts
    } = useContributionTracker(accounts, transactions, currentYear);

    const percentage = (totalContribution / contributionLimit) * 100;
    const remaining = contributionLimit - totalContribution;

    if (retirementAccounts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{currentYear}年 拠出額トラッカー</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        IRAや401kなどの非課税口座が連携されていません。
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{currentYear}年 拠出額トラッカー</CardTitle>
                <CardDescription>
                    IRAなどの非課税口座への年間拠出額の進捗です。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-bold font-mono">¥{totalContribution.toLocaleString()}</span>
                        <span className="text-muted-foreground">
                            残り ¥{remaining.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        年間限度額: ¥{contributionLimit.toLocaleString()}
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold mb-2">拠出取引一覧</h4>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>日付</TableHead>
                                    <TableHead>口座</TableHead>
                                    <TableHead className="text-right">金額</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contributingTransactions.length > 0 ? (
                                    contributingTransactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.bookedAt), 'yyyy/MM/dd')}</TableCell>
                                            <TableCell>
                                                {accounts.find(a => a.id === t.plaidAccountId)?.name}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                ¥{t.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            今年度の拠出取引はまだありません。
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
