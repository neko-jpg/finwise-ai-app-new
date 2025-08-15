'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { PlaidLinkButton } from './plaid-link-button';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useInvestmentPortfolio, EnrichedHolding } from '@/hooks/use-investment-portfolio';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { User } from 'firebase/auth';
import { PlusCircle } from 'lucide-react';
import { CryptoForm } from './crypto-form';

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
      const coinIds = cryptoHoldings.map(h => h.security?.id).filter(Boolean) as string[];
      if (coinIds.length === 0) return;

      try {
        const result = await cryptoApiProxy({
          path: 'simple/price',
          params: { ids: coinIds.join(','), vs_currencies: 'jpy' }
        });
        const prices = Object.entries(result.data).reduce((acc, [id, data]) => {
          acc[id] = (data as { jpy: number }).jpy;
          return acc;
        }, {});
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
          <AccordionTrigger>
            <div className="flex justify-between w-full pr-4">
              <span>{account.name} ({account.mask})</span>
              <span className="font-mono">¥{account.currentBalance.toLocaleString()}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader><TableRow><TableHead>銘柄</TableHead><TableHead className="text-right">現在価値</TableHead></TableRow></TableHeader>
              <TableBody>
                {account.holdings.map(holding => (
                  <TableRow key={holding.id}>
                    <TableCell>{holding.security?.name}</TableCell>
                    <TableCell className="text-right font-mono">¥{holding.institutionValue?.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {holding.security?.logoUrl && <img src={holding.security.logoUrl} alt="" className="w-6 h-6 mr-2 rounded-full" />}
                <div>
                  <div className="font-medium">{holding.security?.name}</div>
                  <div className="text-sm text-muted-foreground">{holding.security?.tickerSymbol?.toUpperCase()}</div>
                </div>
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>総資産</CardTitle>
            <span className="text-2xl font-bold font-mono">¥{Math.round(totalValue).toLocaleString()}</span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>連携済み口座</CardTitle>
          <CardDescription>Plaid経由で連携された株式や投資信託です。</CardDescription>
        </CardHeader>
        <CardContent>
          {plaidAccounts.length > 0 ? renderPlaidAccounts() : <p className="text-muted-foreground">連携された口座はありません。</p>}
          <div className="mt-4 border-t pt-4">
            <PlaidLinkButton user={user || null} familyId={familyId} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>暗号通貨</CardTitle>
            <CardDescription>手動で登録した暗号通貨資産です。</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />追加
          </Button>
        </CardHeader>
        <CardContent>
          {cryptoHoldings.length > 0 ? renderCryptoHoldings() : <p className="text-muted-foreground">登録された暗号通貨はありません。</p>}
        </CardContent>
      </Card>

      <CryptoForm open={isFormOpen} onOpenChange={setIsFormOpen} user={user} familyId={familyId} />
    </div>
  );
}
