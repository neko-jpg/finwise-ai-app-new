
'use client';

import React, { useMemo, useState } from "react";
import { AppHeader } from './app-header';
import { OfflineBanner } from './offline-banner';
import { HomeDashboard } from './home-dashboard';
import { TransactionsScreen } from './transactions-screen';
import { BudgetScreen } from './budget-screen';
import { GoalsScreen } from './goals-screen';
import { ProfileScreen } from './profile-screen';
import { SubscriptionsScreen } from '@/app/subscriptions/page';
import { ReviewsScreen } from '@/app/reviews/page';
import LinkScreen from '@/app/link/page';
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
import { Home } from "lucide-react";

interface AppContainerProps {
    user: User;
}

export function AppContainer({ user }: AppContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [transactionInitialData, setTransactionInitialData] = useState<Partial<TransactionFormValues> | undefined>(undefined);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const { transactions, loading: txLoading, error: txError } = useTransactions(user.uid);
  const { budget, loading: budgetLoading, error: budgetError } = useBudget(user.uid, format(new Date(), 'yyyy-MM'));
  const { goals, loading: goalsLoading, error: goalsError } = useGoals(user.uid);


  const todaySpend = useMemo(() => {
    if (!transactions) return 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return transactions
      .filter((t: Transaction) => t.bookedAt && format(t.bookedAt, 'yyyy-MM-dd') === todayStr)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
  }, [transactions]);

  const {monthUsed, monthLimit} = useMemo(() => {
    if (!budget) return { monthUsed: 0, monthLimit: 0 };
    const used = Object.values(budget.used || {}).reduce((a, b) => a + b, 0);
    const limit = Object.values(budget.limits || {}).reduce((a, b) => a + b, 0);
    return { monthUsed: used, monthLimit: limit };
  }, [budget]);

  const filteredTx = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t: Transaction) => 
      (catFilter ? t.category.major === catFilter : true) && 
      (q ? t.merchant.toLowerCase().includes(q.toLowerCase()) : true)
    );
  }, [transactions, catFilter, q]);

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

  const renderContent = () => {
    switch (tab) {
        case 'home':
            return <HomeDashboard 
                todaySpend={todaySpend}
                monthUsed={monthUsed}
                monthLimit={monthLimit}
                setTab={handleSetTab}
                onOpenTransactionForm={handleOpenTransactionForm}
                onOpenOcr={handleOpenOcr}
                onOpenGoalForm={handleOpenGoalForm}
                transactions={transactions || []}
                budget={budget}
            />;
        case 'tx':
            return <TransactionsScreen 
                q={q} 
                setQ={setQ} 
                filteredTx={filteredTx}
                catFilter={catFilter}
                setCatFilter={setCatFilter}
                loading={txLoading}
                transactions={transactions || []}
            />;
        case 'budget':
            return <BudgetScreen
                uid={user.uid}
                budget={budget}
                loading={budgetLoading}
                transactions={transactions || []}
                goals={goals || []}
            />;
        case 'goals':
            return <GoalsScreen 
                uid={user.uid}
                goals={goals || []}
                loading={goalsLoading}
                onOpenGoalForm={handleOpenGoalForm}
            />;
        case 'profile':
            return <ProfileScreen user={user} offline={offline} setOffline={setOffline} />;
        case 'subscriptions':
            return <SubscriptionsScreen transactions={transactions || []} />;
        case 'reviews':
            return <ReviewsScreen transactions={transactions || []} />;
        case 'link':
            // LinkScreen doesn't need any props
            return <LinkScreen />;
        default:
            return <HomeDashboard 
                todaySpend={todaySpend}
                monthUsed={monthUsed}
                monthLimit={monthLimit}
                setTab={handleSetTab}
                onOpenTransactionForm={handleOpenTransactionForm}
                onOpenOcr={handleOpenOcr}
                onOpenGoalForm={handleOpenGoalForm}
                transactions={transactions || []}
                budget={budget}
            />;
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30 font-body text-foreground">
      <AppHeader 
        onOpenVoice={handleOpenVoice}
        onOpenSettings={() => handleSetTab("profile")}
      />

      {offline && <OfflineBanner />}

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {renderContent()}
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
