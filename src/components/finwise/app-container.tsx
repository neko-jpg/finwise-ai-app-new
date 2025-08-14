
'use client';

import React, { useMemo, useState } from "react";
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
import { GoalForm } from "./goal-form";
import { useRouter, usePathname } from 'next/navigation';

interface AppContainerProps {
    user: User;
    children: React.ReactNode;
}

export function AppContainer({ user, children }: AppContainerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [transactionInitialData, setTransactionInitialData] = useState<Partial<TransactionFormValues> | undefined>(undefined);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  const { transactions, loading: txLoading, error: txError } = useTransactions(user.uid);
  const { budget, loading: budgetLoading, error: budgetError } = useBudget(user.uid, format(new Date(), 'yyyy-MM'));
  const { goals, loading: goalsLoading, error: goalsError } = useGoals(user.uid);

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
      return 'home';
  }, [pathname]);

  const handleSetTab = (newTab: string) => {
    const pathMap: { [key: string]: string } = {
      home: '/',
      tx: '/transactions',
      budget: '/budget',
      goals: '/goals',
      profile: '/profile',
    };
    router.push(pathMap[newTab] || '/');
  };

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
            onOpenTransactionForm: handleOpenTransactionForm,
            onOpenOcr: handleOpenOcr,
            onOpenGoalForm: handleOpenGoalForm,
            setTab: handleSetTab,
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
      />
      <GoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        uid={user.uid}
      />
    </div>
  );
}
