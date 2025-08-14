
'use client';

import React, { useMemo, useState, useEffect } from "react";
import { AppHeader } from './app-header';
import { OfflineBanner } from './offline-banner';
import { BottomNav } from './bottom-nav';
import { VoiceDialog } from './voice-dialog';
import { OcrScanner } from './ocr-scanner';
import { TransactionForm, TransactionFormValues } from './transaction-form';
import type { Budget, Goal, Transaction } from "@/lib/types";
import { useTransactions } from "@/hooks/use-transactions";
import { useGoals } from "@/hooks/use-goals";
import { format } from "date-fns";
import type { User } from 'firebase/auth';
import { useBudget } from "@/hooks/use-budget";
import { GoalForm, GoalFormValues } from "./goal-form";
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthDialog } from '@/components/finwise/auth-dialog';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AppContainerProps {
    children: React.ReactNode;
}

export function AppContainer({ children }: AppContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, loading: authLoading } = useAuthState();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [transactionInitialData, setTransactionInitialData] = useState<Partial<TransactionFormValues> | undefined>(undefined);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  const uid = user?.uid;
  const currentMonth = useMemo(() => format(new Date(), 'yyyy-MM'), []);
  
  const { transactions, setTransactions, loading: txLoading } = useTransactions(uid);
  const { budget, setBudget, loading: budgetLoading } = useBudget(uid, currentMonth);
  const { goals, setGoals, loading: goalsLoading } = useGoals(uid);

  const handleOpenTransactionForm = (initialData?: Partial<TransactionFormValues>) => {
    setTransactionInitialData(initialData);
    setTransactionFormOpen(true);
  };
  
  const handleOpenGoalForm = () => {
    setGoalFormOpen(true);
  };

  const handleOpenVoice = () => {
      setVoiceOpen(true);
  }
  
  const handleOpenOcr = () => {
      setOcrOpen(true);
  }

  const tab = useMemo(() => {
      if (pathname === '/') return 'home';
      if (pathname.startsWith('/transactions')) return 'tx';
      if (pathname.startsWith('/budget')) return 'budget';
      if (pathname.startsWith('/goals')) return 'goals';
      if (pathname.startsWith('/profile')) return 'profile';
      if (pathname.startsWith('/subscriptions')) return 'subscriptions';
      if (pathname.startsWith('/reviews')) return 'reviews';
      if (pathname.startsWith('/link')) return 'link';
      return 'home';
  }, [pathname]);

  const handleSetTab = (newTab: string) => {
    const pathMap: { [key: string]: string } = {
      home: '/',
      tx: '/transactions',
      budget: '/budget',
      goals: '/goals',
      profile: '/profile',
      subscriptions: '/subscriptions',
      reviews: '/reviews',
      link: '/link',
    };
    router.push(pathMap[newTab] || '/');
  };
  
  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
      return (
          <>
            <main className="min-h-dvh bg-gradient-to-b from-[#0B1220] to-[#111827] text-white flex items-center justify-center">
              <div className="mx-auto max-w-4xl px-6 py-14 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">家計、話して、見える。</h1>
                <p className="mt-3 text-white/80">AIがあなたの支出を整理し、今日の一手を提案します。</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={() => setAuthDialogOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    ログイン / 新規登録
                  </Button>
                </div>
              </div>
            </main>
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} onSignin={() => {}}/>
          </>
      )
  }


  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30 font-body text-foreground">
      <AppHeader 
        onOpenVoice={handleOpenVoice}
        onOpenSettings={() => handleSetTab("profile")}
      />

      {offline && <OfflineBanner />}

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {React.cloneElement(children as React.ReactElement, {
            user,
            transactions: transactions || [],
            budget,
            goals: goals || [],
            loading: txLoading || budgetLoading || goalsLoading,
            onOpenTransactionForm: handleOpenTransactionForm,
            onOpenOcr: handleOpenOcr,
            onOpenGoalForm: handleOpenGoalForm,
            setTab: handleSetTab,
            setTransactions,
            setBudget,
            setGoals,
         })}
      </main>

      <BottomNav tab={tab} setTab={handleSetTab} onMic={handleOpenVoice} />

      <VoiceDialog 
        open={voiceOpen} 
        onOpenChange={setVoiceOpen} 
        onComplete={(data) => {
            setVoiceOpen(false);
            handleOpenTransactionForm(data);
        }}
        transactions={transactions || []}
        budget={budget}
        goals={goals || []}
      />
      <OcrScanner
        open={ocrOpen}
        onOpenChange={setOcrOpen}
        onComplete={(data) => {
            setOcrOpen(false);
            handleOpenTransactionForm(data);
        }}
      />
      <TransactionForm 
        open={transactionFormOpen} 
        onOpenChange={setTransactionFormOpen}
        uid={user.uid}
        initialData={transactionInitialData}
        onTransactionAction={(newTx) => {
            setTransactions(prev => [newTx, ...prev].sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime()));
        }}
      />
      <GoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        uid={user.uid}
        onGoalAction={(newGoal) => {
            setGoals(prev => [newGoal, ...(prev || [])].sort((a,b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)));
        }}
      />
    </div>
  );
}
