'use client';

import type { Transaction } from '@/lib/domain';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface DuplicateReviewCardProps {
  tx1: Transaction;
  tx2: Transaction;
  reason: string;
  onMerge: (winnerId: string, loserId: string) => void;
  onDismiss: (tx1Id: string, tx2Id: string) => void;
}

const TransactionDetail = ({ tx }: { tx: Transaction }) => (
  <div className="flex-1 rounded-md border bg-muted/50 p-4">
    <div className="font-bold text-lg">{tx.merchant}</div>
    <div className="font-mono text-xl">¥{tx.amount.toLocaleString()}</div>
    <div className="text-sm text-muted-foreground">{format(tx.bookedAt, 'yyyy-MM-dd')}</div>
    <Badge variant="outline" className="mt-2">{tx.source}</Badge>
  </div>
);

export function DuplicateReviewCard({ tx1, tx2, reason, onMerge, onDismiss }: DuplicateReviewCardProps) {

  // A simple heuristic to pre-select the "winner" transaction to keep after a merge.
  // We prefer the one with a more specific merchant name or the more recent one.
  const winnerId = tx1.merchant.length > tx2.merchant.length ? tx1.id : tx2.id;
  const loserId = winnerId === tx1.id ? tx2.id : tx1.id;

  return (
    <Card className="border-2 border-amber-500/50">
      <CardHeader>
        <CardTitle className="text-lg">重複の可能性あり</CardTitle>
        <CardDescription>{reason}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-4">
        <TransactionDetail tx={tx1} />
        <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />
        <TransactionDetail tx={tx2} />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onDismiss(tx1.id, tx2.id)}>
          <X className="mr-2 h-4 w-4" />
          違う取引
        </Button>
        <Button variant="secondary" onClick={() => onMerge(winnerId, loserId)}>
          <Check className="mr-2 h-4 w-4" />
          同じ取引 (統合する)
        </Button>
      </CardFooter>
    </Card>
  );
}
