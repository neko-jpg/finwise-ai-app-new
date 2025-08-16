'use client';

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { assistant } from '@/ai/flows/assistant';
import { speechToTransaction } from '@/ai/flows/speech-to-transaction';
import type { TransactionFormValues } from './transaction-form';
import type { Budget, Goal, Transaction } from '@/domain';
import { useToast } from '@/hooks/use-toast';

interface VoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: Partial<TransactionFormValues>) => void;
  transactions: Transaction[];
  budget: Budget | null;
  goals: Goal[];
}

type MicStatus = 'idle' | 'listening' | 'processing' | 'error';

export function VoiceDialog({ open, onOpenChange, onComplete, transactions, budget, goals }: VoiceDialogProps) {
  const { toast } = useToast();
  const [_query, setQuery] = useState('');
  const [_response, setResponse] = useState('');
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [_isPending, startTransition] = useTransition();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = useCallback((currentQuery: string) => {
    if (!currentQuery) return;
    setQuery('');
    setResponse('');
    startTransition(async () => {
      setMicStatus('processing');
      try {
        const result = await speechToTransaction({ query: currentQuery });
        if (result.type === 'transaction') {
            onComplete({ merchant: result.merchant, amount: result.amount });
        } else {
            const assistantResult = await assistant({
                query: currentQuery,
                transactions: transactions.map(t => ({...t, bookedAt: t.bookedAt.toISOString(), createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString()})),
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
  }, [onComplete, transactions, budget, goals]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setMicStatus('listening');
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSubmit(transcript);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({ variant: 'destructive', title: 'マイクへのアクセスが拒否されました', description: '音声入力を利用するには、ブラウザの設定でマイクへのアクセスを許可してください。' });
      }
      setMicStatus('error');
    };
    recognition.onend = () => setMicStatus('idle');
    recognitionRef.current = recognition;
  }, [toast, handleSubmit]);

  const _handleMicClick = () => {
    if (!recognitionRef.current) {
        toast({ variant: 'destructive', title: '音声認識はサポートされていません', description: 'お使いのブラウザでは音声認識機能をご利用いただけません。' });
        return;
    }
    if (micStatus === 'listening') {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  
  const _handleQueryClick = (q: string) => {
    setQuery(q);
    handleSubmit(q);
  }

  // ... (rest of the component is the same)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {/* ... */}
    </Dialog>
  )
}
