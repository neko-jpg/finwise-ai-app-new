'use client';

import React, { useMemo, useState, useEffect } from "react";
import { AppHeader } from './app-header';
import { OfflineBanner } from './offline-banner';
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useToast, showErrorToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { applyRulesToTransaction } from "@/lib/rule-engine";
import { createTransactionHash } from "@/lib/utils";
import { BottomNav } from './bottom-nav';
import { VoiceDialog } from './voice-dialog';
import { OcrScanner } from './ocr-scanner';
import { TransactionForm, TransactionFormValues } from './transaction-form';
import type { Budget, Goal, Transaction } from "@/lib/types";
import { useTransactions } from "@/hooks/use-transactions";
import { useGoals } from "@/hooks/use-goals";
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRules } from "@/hooks/use-rules";
import { useInvestmentPortfolio } from '@/hooks/use-investment-portfolio';
import { useNotifications } from '@/hooks/use-notifications';
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

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [transactionInitialData, setTransactionInitialData] = useState<Partial<TransactionFormValues> | undefined>(undefined);
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    const syncPendingTransactions = async () => {
        if (!isOnline) return;

        const pendingTxs = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
        if (pendingTxs.length === 0) return;

        toast({
            title: 'オンラインに復帰しました',
            description: `予約された${pendingTxs.length}件の取引を同期中です...`,
        });

        let successCount = 0;
        const failedTxs = [];

        for (const tx of pendingTxs) {
            try {
                // Recreate the data structure for Firestore
                const newTxData: Omit<Transaction, 'id' | 'hash' | 'createdAt' | 'updatedAt' | 'clientUpdatedAt' | 'deletedAt'> = {
                    amount: tx.amount,
                    originalAmount: tx.amount, // Assuming offline txns are in primary currency for simplicity
                    originalCurrency: userProfile?.primaryCurrency || 'JPY',
                    merchant: tx.merchant,
                    bookedAt: new Date(tx.bookedAt),
                    category: { major: tx.categoryMajor },
                    source: 'manual-offline',
                    scope: tx.scope,
                    taxTag: tx.taxTag || '',
                    familyId: tx.familyId,
                    createdBy: tx.userId,
                };

                const ruledTxData = applyRulesToTransaction(newTxData as Transaction, rules);
                const hash = createTransactionHash(ruledTxData);

                const docData = {
                    ...ruledTxData,
                    bookedAt: Timestamp.fromDate(ruledTxData.bookedAt),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    clientUpdatedAt: new Date(tx.clientTimestamp),
                    deletedAt: null,
                    hash,
                };

                await addDoc(collection(db, `families/${tx.familyId}/transactions`), docData);
                successCount++;
            } catch (error) {
                console.error("Failed to sync pending transaction:", error);
                failedTxs.push(tx);
            }
        }

        if (failedTxs.length > 0) {
            localStorage.setItem('pending_transactions', JSON.stringify(failedTxs));
            showErrorToast(new Error(`${failedTxs.length}件の取引の同期に失敗しました。後ほど再試行されます。`));
        } else {
            localStorage.removeItem('pending_transactions');
            toast({
                title: '同期が完了しました',
                description: `${successCount}件の取引を保存しました。`,
            });
        }
    };

    syncPendingTransactions();
  }, [isOnline, familyId, user, rules, setTransactions, toast, userProfile]);

  const { userProfile, loading: profileLoading } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;

  // 修正点: useTransactionsフックにuser.uidを渡すように変更しました
  const { transactions, setTransactions, loading: transactionsLoading } = useTransactions(familyId, user?.uid);
  const { goals, loading: goalsLoading } = useGoals(familyId);
  const { personalBudget, sharedBudget, setPersonalBudget, setSharedBudget, loading: budgetLoading } = useBudget(familyId, new Date());
  const { rules, loading: rulesLoading } = useRules(user?.uid);
  const { plaidAccounts, loading: accountsLoading } = useInvestmentPortfolio(familyId, user?.uid);
  const { notifications, loading: notificationsLoading } = useNotifications(familyId, user?.uid);

  const loading = authLoading || profileLoading || transactionsLoading || goalsLoading || budgetLoading || rulesLoading || accountsLoading || notificationsLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/entry');
    }
  }, [user, authLoading, router]);

  const handleOpenTransactionForm = (initialData?: Partial<TransactionFormValues>) => {
    setTransactionInitialData(initialData);
    setTransactionFormOpen(true);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const activeTab = useMemo(() => {
    const path = pathname.split('/').pop();
    if (['transactions', 'budget', 'goals', 'rules', 'profile', 'link', 'subscriptions', 'reviews'].includes(path || '')) {
      return path;
    }
    return 'home';
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex flex-col h-screen">
        <header className="p-4 border-b">
          <Skeleton className="h-8 w-32" />
        </header>
        <main className="flex-1 p-4">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
        <footer className="p-4 border-t">
          <div className="flex justify-around">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full relative -top-4" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader user={user} onOcr={() => setOcrOpen(true)} notifications={notifications} />
      {!isOnline && <OfflineBanner />}
      <main className="flex-1 pb-24 pt-16">
        {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  user,
                  familyId,
                  transactions,
                  goals,
                  rules,
                  accounts: plaidAccounts,
                  personalBudget,
                  sharedBudget,
                  setPersonalBudget,
                  setSharedBudget,
                  loading,
                  onOpenTransactionForm: handleOpenTransactionForm,
                } as any)
              : child
          )}
      </main>
      <BottomNav
        tab={activeTab}
        setTab={(tab) => handleNavigation(`/app/${tab === 'home' ? '' : tab}`)}
        onMic={() => setVoiceOpen(true)}
      />
      <VoiceDialog 
        open={voiceOpen} 
        onOpenChange={setVoiceOpen} 
        onComplete={(data) => {
            setVoiceOpen(false);
            handleOpenTransactionForm(data);
        }}
        transactions={transactions || []}
        budget={personalBudget}
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
        rules={rules}
        initialData={transactionInitialData}
        onTransactionAction={(newTx) => {
            setTransactions(prev => [newTx, ...(prev || [])].sort((a, b) => b.bookedAt.getTime() - a.bookedAt.getTime()));
        }}
      />
      <GoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        familyId={familyId}
        user={user}
        onGoalAction={(newGoal) => {
          // This is a simplified update. You might want a more robust state management.
          // setGoals(prev => [...(prev || []), newGoal]);
        }}
      />
    </div>
  );
}
