'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { CATEGORIES } from "@/data/dummy-data";
import type { Transaction } from "@/lib/types";

interface TransactionsScreenProps {
  q: string;
  setQ: (q: string) => void;
  filteredTx: Transaction[];
  catFilter: string | null;
  setCatFilter: (cat: string | null) => void;
}

export function TransactionsScreen({ q, setQ, filteredTx, catFilter, setCatFilter }: TransactionsScreenProps) {
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-xl">取引明細</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="店名・メモ・金額で検索..." className="pl-9" />
                </div>
                <Sheet open={isFilterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">フィルタ</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle className="font-headline">カテゴリで絞り込み</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                    {CATEGORIES.map(c => (
                        <Button
                            key={c.key}
                            variant={catFilter === c.key ? "default" : "secondary"}
                            onClick={() => {
                                setCatFilter(catFilter === c.key ? null : c.key);
                                setFilterSheetOpen(false);
                            }}
                            className="justify-start gap-2"
                        >
                        {c.icon}
                        {c.label}
                        </Button>
                    ))}
                     <Button
                        variant={!catFilter ? "default" : "secondary"}
                        onClick={() => {
                            setCatFilter(null);
                            setFilterSheetOpen(false);
                        }}
                        className="col-span-2"
                        >
                        すべてのカテゴリ
                    </Button>
                    </div>
                </SheetContent>
                </Sheet>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100dvh-20rem)]">
            <div className="divide-y">
              {filteredTx.length > 0 ? filteredTx.map((t: Transaction) => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                       {CATEGORIES.find(c => c.key === t.cat)?.icon || <div className="h-4 w-4"/>}
                    </div>
                    <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold font-mono ${t.amount < 0 ? 'text-foreground' : 'text-green-600'}`}>
                        {t.amount < 0 ? "-" : "+"}¥{Math.abs(t.amount).toLocaleString()}
                    </div>
                    <Badge variant="outline" className="mt-1 font-normal">
                        {CATEGORIES.find(c => c.key === t.cat)?.label || t.cat}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>取引が見つかりません。</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
