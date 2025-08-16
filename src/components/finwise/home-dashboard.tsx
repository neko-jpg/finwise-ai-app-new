'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AdviceCard } from './advice-card';
import { TasksOverview } from './tasks-overview';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import type { Budget, Goal, Transaction, Task, DashboardLayout } from '@/domain';

interface HomeDashboardProps {
  user?: User;
  tasks: Task[];
  transactions: Transaction[];
  budget: Budget | null;
  goals: Goal[];
}

export function HomeDashboard({ user, tasks, transactions, budget, goals }: HomeDashboardProps) {
    const router = useRouter();
    const [layout] = useState<DashboardLayout | null>(null);

    const todaySpend = useMemo(() => {
        const today = new Date();
        return transactions
            .filter(t => new Date(t.bookedAt).toDateString() === today.toDateString() && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }, [transactions]);

    const monthUsed = useMemo(() => {
        return budget?.used ? Object.values(budget.used).reduce((sum, val) => sum + val, 0) : 0;
    }, [budget]);

    const monthLimit = useMemo(() => {
        return budget?.limits ? Object.values(budget.limits).reduce((sum, val) => sum + val, 0) : 0;
    }, [budget]);

    const defaultLayout: DashboardLayout = {
        id: user?.uid || 'default',
        widgets: [
            { id: 'advice', size: 'full', order: 1 },
            { id: 'todaySpend', size: 'half', order: 2 },
            { id: 'monthlyBudget', size: 'half', order: 3 },
            { id: 'quickActions', size: 'full', order: 4 },
        ]
    };

    const currentLayout = layout || defaultLayout;

    const widgetComponents = {
        advice: () => <AdviceCard transactions={transactions} budget={budget} currentBalance={0} />,
        todaySpend: () => <TodaySpendCard todaySpend={todaySpend} />,
        monthlyBudget: () => <MonthlyBudgetCard remain={monthLimit - monthUsed} />,
        quickActions: () => <QuickActionsCard onNavigate={(path: string) => router.push(path)} />,
        goals: () => <GoalsCard goals={goals} />,
        recentTransactions: () => <RecentTransactionsCard transactions={transactions} />,
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <TasksOverview tasks={tasks} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentLayout.widgets
                    .sort((a, b) => a.order - b.order)
                    .map(widget => {
                        const Widget = widgetComponents[widget.id];
                        const colSpan = widget.size === 'full' ? 'md:col-span-3' : 'md:col-span-1';
                        return (
                            <div key={widget.id} className={colSpan}>
                                <Widget />
                            </div>
                        );
                })}
            </div>
        </div>
    );
}

function TodaySpendCard({ todaySpend }: { todaySpend: number }) {
    return <Card><CardHeader><CardTitle>今日の支出</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">¥{todaySpend.toLocaleString()}</p></CardContent></Card>
}
function MonthlyBudgetCard({ remain }: { remain: number }) {
    return <Card><CardHeader><CardTitle>今月の残り予算</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">¥{remain.toLocaleString()}</p></CardContent></Card>
}
function QuickActionsCard({ onNavigate }: { onNavigate: (path: string) => void }) {
    return <Card><CardHeader><CardTitle>クイックアクション</CardTitle></CardHeader><CardContent><Button onClick={() => onNavigate('/app/transactions')}>取引を見る</Button></CardContent></Card>
}
function GoalsCard({ goals }: { goals: Goal[] }) {
    return <Card><CardHeader><CardTitle>目標</CardTitle></CardHeader><CardContent><p>{goals.length}個の目標</p></CardContent></Card>
}
function RecentTransactionsCard({ transactions }: { transactions: Transaction[] }) {
    return <Card><CardHeader><CardTitle>最近の取引</CardTitle></CardHeader><CardContent><p>{transactions.length}件の取引</p></CardContent></Card>
}
