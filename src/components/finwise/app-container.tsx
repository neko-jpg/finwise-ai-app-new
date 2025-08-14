
'use client';

import React, { useMemo, useState } from "react";
import { AppHeader } from './app-header';
import { OfflineBanner } from './offline-banner';
import { HomeDashboard } from './home-dashboard';
import { TransactionsScreen } from './transactions-screen';
import { BudgetScreen } from './budget-screen';
import { GoalsScreen } from './goals-screen';
import { ProfileScreen } from './profile-screen';
import { BottomNav } from './bottom-nav';
import { VoiceDialog } from './voice-dialog';
import { TransactionForm } from './transaction-form';
import type { Budget, Transaction } from "@/lib/types";
import { useTransactions } from "@/hooks/use-transactions";
import { INITIAL_BUDGET } from "@/data/dummy-data";
import { format } from "date-fns";
import type { User } from 'firebase/auth';
import { useBudget } from "@/hooks/use-budget";

interface AppContainerProps {
    user: User;
}

export function AppContainer({ user }: AppContainerProps) {
  const [tab, setTab] = useState("home");
  const [q, setQ] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const { transactions, loading: txLoading, error: txError } = useTransactions(user.uid);
  const { budget, loading: budgetLoading, error: budgetError } = useBudget(user.uid, format(new Date(), 'yyyy-MM'));

  const todaySpend = useMemo(() => {
    if (!transactions) return 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return transactions
      .filter((t: Transaction) => format(t.bookedAt, 'yyyy-MM-dd') === todayStr)
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

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30 font-body text-foreground">
      <AppHeader 
        onOpenVoice={() => setVoiceOpen(true)} 
        onOpenSettings={() => setTab("profile")}
      />

      {offline && <OfflineBanner />}

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {tab === "home" && (
          <HomeDashboard 
            todaySpend={todaySpend} 
            monthUsed={monthUsed} 
            monthLimit={monthLimit} 
            setTab={setTab}
            onOpenTransactionForm={() => setTransactionFormOpen(true)}
          />
        )}
        {tab === "tx" && (
          <TransactionsScreen 
            q={q} 
            setQ={setQ} 
            filteredTx={filteredTx} 
            catFilter={catFilter} 
            setCatFilter={setCatFilter}
            loading={txLoading}
          />
        )}
        {tab === "budget" && (
          <BudgetScreen 
            uid={user.uid}
            budget={budget} 
            loading={budgetLoading}
          />
        )}
        {tab === "goals" && (
          <GoalsScreen />
        )}
        {tab === "profile" && (
          <ProfileScreen offline={offline} setOffline={setOffline} user={user} />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} onMic={() => setVoiceOpen(true)} />

      <VoiceDialog open={voiceOpen} onOpenChange={setVoiceOpen} />
      <TransactionForm open={transactionFormOpen} onOpenChange={setTransactionFormOpen} uid={user.uid} />
    </div>
  );
}
