
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
import { useUserProfile } from '@/hooks/use-user-profile';
import { format } from "date-fns";
import type { User } from 'firebase/auth';
import { useBudget } from "@/hooks/use-budget";
import { GoalForm } from "./goal-form";
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from '@/hooks/use-auth-state';
import { Skeleton } from '@/components/ui/skeleton';

interface AppContainerProps {
    children: React.ReactNode;
}

export function AppContainer({ children }: AppContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, loading: authLoading } = useAuthState();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/entry');
    }
  }, [user, authLoading, router]);


  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [transactionInitialData, setTransactionInitialData] = useState<Partial<TransactionFormValues> | undefined>(undefined);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [offline, setOffline] = useState(false);

  const uid = user?.uid;
  const { userProfile, loading: profileLoading } = useUserProfile(uid);
  const familyId = userProfile?.familyId;

  const currentMonth = useMemo(() => format(new Date(), 'yyyy-MM'), []);
  
  const { transactions, setTransactions, loading: txLoading } = useTransactions(familyId);
  const { budget, setBudget, loading: budgetLoading } = useBudget(familyId, currentMonth);
  const { goals, setGoals, loading: goalsLoading } = useGoals(familyId);

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
      if (pathname === '/app') return 'home';
      if (pathname.startsWith('/app/transactions')) return 'tx';
      if (pathname.startsWith('/app/investments')) return 'investments';
      if (pathname.startsWith('/app/reports')) return 'reports';
      if (pathname.startsWith('/app/goals')) return 'goals';
      if (pathname.startsWith('/app/profile')) return 'profile';
      if (pathname.startsWith('/app/subscriptions')) return 'subscriptions';
      if (pathname.startsWith('/app/reviews')) return 'reviews';
      if (pathname.startsWith('/app/link')) return 'link';
      return 'home';
  }, [pathname]);

  const handleSetTab = (newTab: string) => {
    const pathMap: { [key: string]: string } = {
      home: '/app',
      tx: '/app/transactions',
      investments: '/app/investments',
      reports: '/app/reports',
      goals: '/app/goals',
      profile: '/app/profile',
      subscriptions: '/app/subscriptions',
      reviews: '/app/reviews',
      link: '/app/link',
    };
    router.push(pathMap[newTab] || '/app');
  };
  
  if (authLoading || !user) {
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
        familyId={familyId}
        user={user}
        primaryCurrency={userProfile?.primaryCurrency || 'JPY'}
        initialData={transactionInitialData}
        onTransactionAction={(newTx) => {
            if (!transactions) return;
            setTransactions(prev => [newTx, ...prev].sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime()));
        }}
      />
      <GoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        familyId={familyId}
        user={user}
        primaryCurrency={userProfile?.primaryCurrency || 'JPY'}
        onGoalAction={(newGoal) => {
            setGoals(prev => [newGoal, ...(prev || [])].sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
        }}
      />
    </div>
  );
}
