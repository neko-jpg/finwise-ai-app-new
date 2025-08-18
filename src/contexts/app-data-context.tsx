'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type {
  Transaction,
  Goal,
  Rule,
  Account,
  Budget,
  AuthUser,
} from '@/lib/domain';
import { useTransactions } from '@/hooks/use-transactions';
import { useGoals } from '@/hooks/use-goals';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRules } from '@/hooks/use-rules';
import { useInvestmentPortfolio } from '@/hooks/use-investment-portfolio';
import { useNotifications } from '@/hooks/use-notifications';
import { useBudget } from '@/hooks/use-budget';
import { useAuthState } from '@/hooks/use-auth-state';
import {
  TransactionForm,
  TransactionFormValues,
} from '@/components/finwise/transaction-form';
import { VoiceDialog } from '@/components/finwise/voice-dialog';
import { OcrScanner } from '@/components/finwise/ocr-scanner';
import { GoalForm } from '@/components/finwise/goal-form';
import { InteractiveTutorial } from '@/components/finwise/InteractiveTutorial';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { showErrorToast, useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface AppDataContextType {
  user: AuthUser | null;
  familyId?: string;
  transactions: Transaction[];
  goals: Goal[];
  rules: Rule[];
  accounts: Account[];
  currentBalance: number;
  personalBudget: Budget | null;
  sharedBudget: Budget | null;
  setPersonalBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  setSharedBudget: React.Dispatch<React.SetStateAction<Budget | null>>;
  loading: boolean;
  onOpenTransactionForm: (initialData?: any) => void;
  createTransaction: (
    transaction: Omit<Transaction, 'id' | 'hash'>,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, 'id'>>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  primaryCurrency: string;
  userProfile: any;
  notifications: any[];
  onboardingComplete: boolean;
  handleCompleteOnboarding: () => void;
  setGoalFormOpen: (open: boolean) => void;
  setVoiceOpen: (open: boolean) => void;
  setOcrOpen: (open: boolean) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined,
);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthState();
  const { userProfile, loading: profileLoading } = useUserProfile(user?.uid);
  const familyId = userProfile?.familyId;
  const router = useRouter();

  const {
    transactions,
    loading: transactionsLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setTransactions,
  } = useTransactions(familyId);

  const { goals, loading: goalsLoading } = useGoals(familyId);
  const {
    personalBudget,
    sharedBudget,
    setPersonalBudget,
    setSharedBudget,
    loading: budgetLoading,
  } = useBudget(familyId, new Date(), user?.uid);
  const { rules, loading: rulesLoading } = useRules(user?.uid);
  const { plaidAccounts, loading: accountsLoading } = useInvestmentPortfolio(
    familyId,
    user?.uid,
  );
  const { notifications, loading: notificationsLoading } = useNotifications(
    familyId,
    user?.uid,
  );

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [transactionInitialData, setTransactionInitialData] =
    useState<any>(undefined);
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/entry');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const syncPendingTransactions = async () => {
      if (!isOnline || !familyId || !user || !rules || !userProfile) return;
      const pendingTxsStr = localStorage.getItem('pending_transactions');
      if (!pendingTxsStr) return;

      const pendingTxs: Transaction[] = JSON.parse(pendingTxsStr);
      if (pendingTxs.length === 0) return;

      toast({
        title: 'Online again',
        description: `Syncing ${pendingTxs.length} pending transactions...`,
      });
      let successCount = 0;
      const failedTxs = [];

      for (const tx of pendingTxs) {
        try {
          await createTransaction(tx);
          successCount++;
        } catch (error) {
          console.error('Failed to sync pending transaction:', error);
          failedTxs.push(tx);
        }
      }

      if (failedTxs.length > 0) {
        localStorage.setItem(
          'pending_transactions',
          JSON.stringify(failedTxs),
        );
        showErrorToast(
          new Error(
            `${failedTxs.length} transactions failed to sync. They will be retried later.`,
          ),
        );
      } else {
        localStorage.removeItem('pending_transactions');
        toast({
          title: 'Sync complete',
          description: `${successCount} transactions were saved.`,
        });
      }
    };

    void syncPendingTransactions();
  }, [
    isOnline,
    familyId,
    user,
    rules,
    toast,
    userProfile,
    createTransaction,
  ]);

  const loading =
    authLoading ||
    profileLoading ||
    transactionsLoading ||
    goalsLoading ||
    budgetLoading ||
    rulesLoading ||
    accountsLoading ||
    notificationsLoading;

  const currentBalance = useMemo(
    () => plaidAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0),
    [plaidAccounts],
  );

  useEffect(() => {
    if (userProfile) {
      setOnboardingComplete(userProfile.hasCompletedOnboarding ?? false);
    }
  }, [userProfile]);

  const handleCompleteOnboarding = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { hasCompletedOnboarding: true });
      setOnboardingComplete(true);
    } catch (e) {
      console.error('Failed to update onboarding status:', e);
      showErrorToast(new Error('Failed to update onboarding status.'));
    }
  };

  const onOpenTransactionForm = (initialData?: any) => {
    setTransactionInitialData(initialData);
    setTransactionFormOpen(true);
  };

  const handleTransactionAction = useCallback(
    async (newTx: Transaction, isUpdate: boolean) => {
      if (isUpdate) {
        await updateTransaction(newTx.id, newTx);
      } else {
        await createTransaction(newTx);
      }
      // Optimistic update
      setTransactions((prev: Transaction[]) => {
        const existing = prev.find((t) => t.id === newTx.id);
        if (existing) {
          return prev.map((t) => (t.id === newTx.id ? newTx : t));
        }
        return [newTx, ...prev].sort(
          (a, b) => b.bookedAt.getTime() - a.bookedAt.getTime(),
        );
      });
    },
    [createTransaction, updateTransaction, setTransactions],
  );

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

  const value = {
    user,
    familyId,
    transactions: transactions || [],
    goals: goals || [],
    rules: rules || [],
    accounts: plaidAccounts || [],
    currentBalance,
    personalBudget,
    sharedBudget,
    setPersonalBudget,
    setSharedBudget,
    loading,
    onOpenTransactionForm,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    primaryCurrency: userProfile?.primaryCurrency || 'JPY',
    userProfile,
    notifications: notifications || [],
    onboardingComplete,
    handleCompleteOnboarding,
    setGoalFormOpen,
    setOcrOpen,
    setVoiceOpen,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
      <VoiceDialog
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        onComplete={(data) => {
          setVoiceOpen(false);
          onOpenTransactionForm(data);
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
          onOpenTransactionForm(data);
        }}
      />
      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={setTransactionFormOpen}
        familyId={familyId!}
        user={user}
        primaryCurrency={userProfile?.primaryCurrency || 'JPY'}
        rules={rules || []}
        initialData={transactionInitialData}
        onTransactionAction={handleTransactionAction}
      />
      <GoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        familyId={familyId}
        user={user}
        onGoalAction={(_newGoal) => {}}
      />
      {!onboardingComplete && (
        <InteractiveTutorial
          onStartOcr={() => setOcrOpen(true)}
          onComplete={handleCompleteOnboarding}
        />
      )}
    </AppDataContext.Provider>
  );
}
