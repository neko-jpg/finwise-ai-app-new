'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { PlaidLinkButton } from './plaid-link-button';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useInvestmentPortfolio } from '@/hooks/use-investment-portfolio';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { User } from 'firebase/auth';
import { PlusCircle } from 'lucide-react';
import { CryptoForm } from './crypto-form';
import { DividendTracker } from './dividend-tracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import type { Account, Holding, Security } from '@/domain';

const functions = getFunctions();
const cryptoApiProxy = httpsCallable(functions, 'cryptoApiProxy');

interface InvestmentsScreenProps {
  user?: User;
}

export function InvestmentsScreen({ user }: InvestmentsScreenProps) {
  const { userProfile } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;
  const { plaidAccounts, cryptoHoldings, loading, error } = useInvestmentPortfolio(familyId, user?.uid);
  const [cryptoPrices, setCryptoPrices] = useState<{ [id: string]: number }>({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      const coinIds = cryptoHoldings.map(h => h.securityId).filter(Boolean);
      if (coinIds.length === 0) return;

      try {
        const result = await cryptoApiProxy({
          path: 'simple/price',
          params: { ids: coinIds.join(','), vs_currencies: 'jpy' }
        });
        const prices = Object.entries(result.data as Record<string, { jpy: number }>).reduce((acc, [id, data]) => {
          acc[id] = data.jpy;
          return acc;
        }, {} as Record<string, number>);
        setCryptoPrices(prices);
      } catch (e) {
        console.error("Failed to fetch crypto prices", e);
      }
    };
    fetchPrices();
  }, [cryptoHoldings]);

  const totalPlaidValue = plaidAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalCryptoValue = cryptoHoldings.reduce((sum, holding) => {
    const price = cryptoPrices[holding.securityId] || 0;
    return sum + (holding.quantity * price);
  }, 0);
  const totalValue = totalPlaidValue + totalCryptoValue;

  const renderPlaidAccounts = () => (
    <Accordion type="single" collapsible className="w-full" defaultValue={plaidAccounts[0]?.id}>
      {plaidAccounts.map(account => (
        <AccordionItem value={account.id} key={account.id}>
          <AccordionTrigger><div className="flex justify-between w-full pr-4"><span>{account.name} ({account.mask})</span><span className="font-mono">¥{account.currentBalance.toLocaleString()}</span></div></AccordionTrigger>
          <AccordionContent>
            {/* Plaid holdings display would go here if available */}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  const renderCryptoHoldings = () => (
    <Table>
      <TableHeader><TableRow><TableHead>銘柄</TableHead><TableHead className="text-right">数量</TableHead><TableHead className="text-right">現在価値</TableHead></TableRow></TableHeader>
      <TableBody>
        {cryptoHoldings.map(holding => {
          const price = cryptoPrices[holding.securityId] || 0;
          const value = holding.quantity * price;
          return (
            <TableRow key={holding.id}>
              <TableCell className="flex items-center">
                {/* We need a way to get security details like logo and name from securityId */}
                <div><div className="font-medium">{holding.securityId}</div></div>
              </TableCell>
              <TableCell className="text-right font-mono">{holding.quantity.toFixed(4)}</TableCell>
              <TableCell className="text-right font-mono">¥{Math.round(value).toLocaleString()}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div className="text-destructive">データ読み込みエラー</div>;

  return (
    <div className="space-y-6">
      <Card><CardHeader><div className="flex justify-between items-center"><CardTitle>総資産</CardTitle><span className="text-2xl font-bold font-mono">¥{Math.round(totalValue).toLocaleString()}</span></div></CardHeader></Card>
      <Tabs defaultValue="stocks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stocks">株式/投資信託</TabsTrigger>
          <TabsTrigger value="crypto">暗号通貨</TabsTrigger>
          <TabsTrigger value="dividends">配当</TabsTrigger>
        </TabsList>
        <TabsContent value="stocks">
          <Card><CardHeader><CardTitle>連携済み口座</CardTitle><CardDescription>Plaid経由で連携された株式や投資信託です。</CardDescription></CardHeader>
            <CardContent>
              {plaidAccounts.length > 0 ? renderPlaidAccounts() : <p className="text-muted-foreground">連携された口座はありません。</p>}
              <div className="mt-4 border-t pt-4"><PlaidLinkButton user={user || null} familyId={familyId} /></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="crypto">
          <Card><CardHeader className="flex flex-row justify-between items-center"><div><CardTitle>暗号通貨</CardTitle><CardDescription>手動で登録した暗号通貨資産です。</CardDescription></div><Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />追加</Button></CardHeader>
            <CardContent>
              {cryptoHoldings.length > 0 ? renderCryptoHoldings() : <p className="text-muted-foreground">登録された暗号通貨はありません。</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dividends">
            <Card>
                <CardHeader><CardTitle>配当履歴</CardTitle><CardDescription>保有する株式の配当金支払い履歴です。</CardDescription></CardHeader>
                <CardContent><DividendTracker accounts={plaidAccounts} /></CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      <CryptoForm open={isFormOpen} onOpenChange={setIsFormOpen} user={user} familyId={familyId} />
    </div>
  );
}
