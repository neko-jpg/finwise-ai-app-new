'use client';

import React, { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mic, Search, Bot, Loader } from "lucide-react";
import { assistant } from '@/ai/flows/assistant';

interface VoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_QUERIES = [
    "今日の支出は？",
    "食費の残額",
    "今週の無駄遣いを教えて",
    "台湾旅行の進捗はどう？",
]

export function VoiceDialog({ open, onOpenChange }: VoiceDialogProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (currentQuery: string) => {
    if (!currentQuery) return;
    setResponse('');
    startTransition(async () => {
      try {
        const result = await assistant({ query: currentQuery });
        setResponse(result.response);
      } catch (e) {
        console.error(e);
        setResponse('エラーが発生しました。もう一度お試しください。');
      }
    });
  };
  
  const handleQueryClick = (q: string) => {
    setQuery(q);
    handleSubmit(q);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><Mic/>音声アシスタント</DialogTitle>
          <DialogDescription>例：「今日の支出は？」「食費の予算残額は？」</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <Input 
            placeholder="聞きたいことを話すか入力..." 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
            disabled={isPending}
          />
          <Button size="icon" onClick={() => handleSubmit(query)} disabled={isPending}>
            {isPending ? <Loader className="animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
            {QUICK_QUERIES.map((q) => (
                 <Button key={q} variant="outline" size="sm" className="text-xs h-auto py-1.5" onClick={() => handleQueryClick(q)} disabled={isPending}>
                    {q}
                </Button>
            ))}
        </div>
        
        {isPending && (
            <div className="mt-4 flex items-center justify-center text-muted-foreground">
                <Loader className="animate-spin mr-2" />
                <span>AIが回答を生成中...</span>
            </div>
        )}

        {response && (
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="font-bold text-sm">Finwiseアシスタント</p>
                        <p className="mt-1 text-sm">{response}</p>
                    </div>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
