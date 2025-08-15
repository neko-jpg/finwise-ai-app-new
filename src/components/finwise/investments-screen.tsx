'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlaidLinkButton } from './plaid-link-button';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useInvestmentData } from '@/hooks/use-investment-data';
import type { User } from 'firebase/auth';

interface InvestmentsScreenProps {
  user?: User;
}

export function InvestmentsScreen({ user }: InvestmentsScreenProps) {
  const { userProfile } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;
  const { accounts, loading, error } = useInvestmentData(familyId);

  const totalValue = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  const renderContent = () => {
    if (loading) {
      return <p>読み込み中...</p>;
    }
    if (error) {
      return <p className="text-destructive">データの読み込みに失敗しました。</p>;
    }
    if (accounts.length === 0) {
      return <p className="text-muted-foreground">連携された口座はありません。</p>;
    }
    return (
      <Accordion type="single" collapsible className="w-full" defaultValue={accounts[0]?.id}>
        {accounts.map(account => (
          <AccordionItem value={account.id} key={account.id}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span>{account.name} ({account.mask})</span>
                <span className="font-mono">¥{account.currentBalance.toLocaleString()}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>銘柄</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead className="text-right">現在価値</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.holdings.map(holding => (
                    <TableRow key={holding.id}>
                      <TableCell>
                        <div className="font-medium">{holding.security?.name}</div>
                        <div className="text-sm text-muted-foreground">{holding.security?.tickerSymbol}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{holding.quantity.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">¥{holding.institutionValue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline">投資</h2>
        <p className="text-muted-foreground">ポートフォリオを連携して、資産を追跡しましょう。</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ポートフォリオ概要</CardTitle>
            <span className="text-2xl font-bold font-mono">¥{totalValue.toLocaleString()}</span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>連携済み口座</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
          <div className="mt-4 border-t pt-4">
            <PlaidLinkButton user={user || null} familyId={familyId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
