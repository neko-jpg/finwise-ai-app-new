'use client';

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { EnrichedPlaidAccount } from '@/hooks/use-investment-portfolio';

const functions = getFunctions();
const getDividendDataFn = httpsCallable(functions, 'getDividendData');

interface DividendTrackerProps {
  accounts: EnrichedPlaidAccount[];
}

interface FinnhubDividend {
    symbol: string;
    date: string; // "YYYY-MM-DD"
    amount: number;
    currency: string;
}

export function DividendTracker({ accounts }: DividendTrackerProps) {
    const { toast } = useToast();
    const [dividends, setDividends] = useState<FinnhubDividend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDividends = async () => {
            setLoading(true);
            const holdingSecurities = accounts.flatMap(acc => acc.holdings.map(h => h.security));
            const uniqueSymbols = [...new Set(holdingSecurities.map(sec => sec?.tickerSymbol).filter(Boolean) as string[])];

            if (uniqueSymbols.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const dividendPromises = uniqueSymbols.map(symbol => getDividendDataFn({ symbol }));
                const results = await Promise.all(dividendPromises);

                const allDividends = results.flatMap(result => result.data as FinnhubDividend[]);
                allDividends.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setDividends(allDividends);
            } catch (error) {
                console.error("Failed to fetch dividend data", error);
                toast({ title: "配当データの取得に失敗しました", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        void fetchDividends();
    }, [accounts, toast]);

    if (loading) {
        return <div>配当データを読み込み中...</div>;
    }

    if (dividends.length === 0) {
        return <p className="text-muted-foreground text-center py-4">対象となる配当情報はありません。</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>銘柄</TableHead>
                    <TableHead>権利落ち日</TableHead>
                    <TableHead className="text-right">配当額</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {dividends.map((div, index) => (
                    <TableRow key={`${div.symbol}-${div.date}-${index}`}>
                        <TableCell className="font-medium">{div.symbol}</TableCell>
                        <TableCell>{div.date}</TableCell>
                        <TableCell className="text-right font-mono">{div.amount.toFixed(2)} {div.currency}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
