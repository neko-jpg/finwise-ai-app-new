
'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mic, Search, Bot, Loader, AlertTriangle } from "lucide-react";
import { assistant } from '@/ai/flows/assistant';
import { speechToTransaction } from '@/ai/flows/speech-to-transaction';
import type { TransactionFormValues } from './transaction-form';
import type { Budget, Goal, Transaction } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

interface VoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: Partial<TransactionFormValues>) => void;
  transactions: Transaction[];
  budget: Budget | null;
  goals: Goal[];
}

const QUICK_QUERIES = [
    "今日の支出は？",
    "食費の残額",
    "今週の無駄遣いを教えて",
    "台湾旅行の進捗はどう？",
]

type MicStatus = 'idle' | 'listening' | 'processing' | 'error';

export function VoiceDialog({ open, onOpenChange, onComplete, transactions, budget, goals }: VoiceDialogProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [isPending, startTransition] = useTransition();

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setMicStatus('listening');
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSubmit(transcript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast({
              variant: 'destructive',
              title: 'マイクへのアクセスが拒否されました',
              description: '音声入力を利用するには、ブラウザの設定でマイクへのアクセスを許可してください。',
          });
        }
        setMicStatus('error');
      };
      recognition.onend = () => setMicStatus('idle');

      recognitionRef.current = recognition;
    }
  }, [toast]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({
            variant: 'destructive',
            title: '音声認識はサポートされていません',
            description: 'お使いのブラウザでは音声認識機能をご利用いただけません。',
        });
        return;
    }
    if (micStatus === 'listening') {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (currentQuery: string) => {
    if (!currentQuery) return;
    setQuery('');
    setResponse('');
    startTransition(async () => {
      setMicStatus('processing');
      try {
        const result = await speechToTransaction({ query: currentQuery });
        if (result.type === 'transaction') {
            onComplete({
                merchant: result.merchant,
                amount: result.amount,
            });
        } else {
            const assistantResult = await assistant({
                query: currentQuery,
                transactions: transactions.map(t => ({...t, bookedAt: t.bookedAt.toISOString()})),
                budget,
                goals: goals.map(g => ({...g, due: g.due?.toISOString()})),
            });
            setResponse(assistantResult.response);
        }
      } catch (e) {
        console.error(e);
        setResponse('エラーが発生しました。もう一度お試しください。');
      } finally {
        setMicStatus('idle');
      }
    });
  };
  
  const handleQueryClick = (q: string) => {
    setQuery(q);
    handleSubmit(q);
  }

  const MicButton = () => (
    <Button size="icon" onClick={handleMicClick} disabled={isPending}>
      {micStatus === 'listening' && <Mic className="h-4 w-4 text-red-500 animate-pulse" />}
      {micStatus === 'processing' && <Loader className="animate-spin" />}
      {micStatus === 'idle' && <Mic className="h-4 w-4" />}
      {micStatus === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setQuery('');
            setResponse('');
            if (recognitionRef.current && micStatus === 'listening') {
                recognitionRef.current.stop();
            }
            setMicStatus('idle');
        }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><Mic/>音声アシスタント</DialogTitle>
          <DialogDescription>「カフェで580円」のように話すか、質問を入力してください。</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <Input 
            placeholder={micStatus === 'listening' ? "お話しください..." : "聞きたいことを話すか入力..."}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
            disabled={isPending || micStatus === 'listening'}
          />
          {recognitionRef.current ? <MicButton /> : (
             <Button size="icon" onClick={() => handleSubmit(query)} disabled={isPending}>
                {isPending ? <Loader className="animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {!recognitionRef.current && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>音声認識に非対応</AlertTitle>
                <AlertDescription>お使いのブラウザは音声認識をサポートしていません。テキストで入力してください。</AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-2 gap-2 mt-2">
            {QUICK_QUERIES.map((q) => (
                 <Button key={q} variant="outline" size="sm" className="text-xs h-auto py-1.5" onClick={() => handleQueryClick(q)} disabled={isPending || micStatus === 'listening'}>
                    {q}
                </Button>
            ))}
        </div>
        
        {isPending && !response && (
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
