'use client';

import React, { useMemo, useState } from "react";
import { DEMO_TRANSACTIONS, INITIAL_BUDGET } from '@/data/dummy-data';
import { AppHeader } from './app-header';
import { OfflineBanner } from './offline-banner';
import { HomeDashboard } from './home-dashboard';
import { TransactionsScreen } from './transactions-screen';
import { BudgetScreen } from './budget-screen';
import { GoalsScreen } from './goals-screen';
import { ProfileScreen } from './profile-screen';
import { BottomNav } from './bottom-nav';
import { VoiceDialog } from './voice-dialog';
import type { Budget, Transaction } from "@/lib/types";

export default function AppContainer() {
  const [tab, setTab] = useState("home");
  const [q, setQ] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [budget, setBudget] = useState<Budget>(INITIAL_BUDGET);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const todaySpend = useMemo(() => DEMO_TRANSACTIONS.filter((t: Transaction) => t.date === "2025-08-13").reduce((a, b) => a + Math.abs(b.amount), 0), []);
  const monthUsed = useMemo(() => Object.values(budget).reduce((a, b) => a + b.used, 0), [budget]);
  const monthLimit = useMemo(() => Object.values(budget).reduce((a, b) => a + b.limit, 0), [budget]);

  const filteredTx = useMemo(() => DEMO_TRANSACTIONS.filter((t: Transaction) => (catFilter ? t.cat === catFilter : true) && (q ? t.name.toLowerCase().includes(q.toLowerCase()) : true)), [catFilter, q]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30 font-body text-foreground">
      <AppHeader onOpenVoice={() => setVoiceOpen(true)} onOpenSettings={() => setTab("profile")} />

      {offline && <OfflineBanner />}

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {tab === "home" && (
          <HomeDashboard todaySpend={todaySpend} monthUsed={monthUsed} monthLimit={monthLimit} setTab={setTab} />
        )}
        {tab === "tx" && (
          <TransactionsScreen q={q} setQ={setQ} filteredTx={filteredTx} catFilter={catFilter} setCatFilter={setCatFilter} />
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
    </div>
  );
}
