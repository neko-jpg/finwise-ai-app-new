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


export function AppContainer() {
  const [tab, setTab] = useState("home");
  const [q, setQ] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [budget, setBudget] = useState<Budget>(INITIAL_BUDGET);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  // TODO: Replace with actual user ID from Firebase Auth
  const uid = 'user-123';
  const { transactions, loading, error } = useTransactions(uid);

  const todaySpend = useMemo(() => {
    if (!transactions) return 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return transactions
      .filter((t: Transaction) => format(t.bookedAt, 'yyyy-MM-dd') === todayStr)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
  }, [transactions]);

  // Note: Budget calculation is still based on dummy data. This will be updated later.
  const monthUsed = useMemo(() => Object.values(budget).reduce((a, b) => a + b.used, 0), [budget]);
  const monthLimit = useMemo(() => Object.values(budget).reduce((a, b) => a + b.limit, 0), [budget]);

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
        onOpenTransactionForm={() => setTransactionFormOpen(true)}
      />

      {offline && <OfflineBanner />}

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {tab === "home" && (
          <HomeDashboard todaySpend={todaySpend} monthUsed={monthUsed} monthLimit={monthLimit} setTab={setTab} />
        )}
        {tab === "tx" && (
          <TransactionsScreen 
            q={q} 
            setQ={setQ} 
            filteredTx={filteredTx} 
            catFilter={catFilter} 
            setCatFilter={setCatFilter}
            loading={loading}
          />
        )}
        {tab === "budget" && (
          <BudgetScreen budget={budget} setBudget={setBudget} />
        )}
        {tab === "goals" && (
          <GoalsScreen />
        )}
        {tab === "profile" && (
          <ProfileScreen offline={offline} setOffline={setOffline} />
        )}
      </main>

      <BottomNav tab={tab} setTab={setTab} onMic={() => setVoiceOpen(true)} />

      <VoiceDialog open={voiceOpen} onOpenChange={setVoiceOpen} />
      <TransactionForm open={transactionFormOpen} onOpenChange={setTransactionFormOpen} />
    </div>
  );
}
