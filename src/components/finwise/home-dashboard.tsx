'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, ScanLine, LayoutDashboard, Save } from "lucide-react";
import { AdviceCard } from "./advice-card";
import { QuickActions } from "./quick-actions";
import { TasksOverview } from "./tasks-overview";
import type { TransactionFormValues } from "./transaction-form";
import type { Transaction, Budget, Goal, WidgetConfig, WidgetId, DashboardLayout, Task } from "@/lib/types";
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import type { User } from 'firebase/auth';

interface HomeDashboardProps {
  user?: User;
  tasks?: Task[];
  transactions?: Transaction[];
  budget?: Budget | null;
  goals?: Goal[];
  loading?: boolean;
  setTab?: (t: string) => void;
  onOpenTransactionForm?: (initialData?: Partial<TransactionFormValues>) => void;
  onOpenOcr?: () => void;
  onOpenGoalForm?: () => void;
}

const StubWidget: React.FC<{title: string}> = ({ title }) => (
    <div className="border rounded-lg p-4 h-full bg-card text-card-foreground">
        <h3 className="font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm">This widget is temporarily disabled.</p>
    </div>
);

const WidgetMap: Record<WidgetId, React.FC<any>> = {
    todaySpend: () => <StubWidget title="Today's Spend" />,
    monthlyBudget: () => <StubWidget title="Monthly Budget" />,
    advice: AdviceCard,
    quickActions: QuickActions,
    goals: () => <div className="border rounded-lg p-4 h-full bg-card text-card-foreground">Goals Widget</div>,
    recentTransactions: () => <div className="border rounded-lg p-4 h-full bg-card text-card-foreground">Recent Transactions Widget</div>
};

const sizeToClassMap: Record<WidgetConfig['size'], string> = {
    full: 'md:col-span-6',
    half: 'md:col-span-3',
    third: 'md:col-span-2',
};

export function HomeDashboard({ 
    user,
    tasks = [],
    transactions = [], 
    budget = null,
    goals = [],
    loading: propsLoading,
    setTab = () => {}, 
    onOpenTransactionForm = () => {}, 
    onOpenOcr = () => {},
    onOpenGoalForm = () => {}
}: HomeDashboardProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [localLayout, setLocalLayout] = useState<DashboardLayout | null>({
    widgets: [
        { id: 'advice', size: 'full', order: 1 },
        { id: 'todaySpend', size: 'half', order: 2 },
        { id: 'monthlyBudget', size: 'half', order: 3 },
        { id: 'quickActions', size: 'full', order: 4 },
    ]
  });
  const layoutLoading = false;


  useEffect(() => {
  }, []);

  const todaySpend = useMemo(() => {
    if (!transactions) return 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return transactions
      .filter((t: Transaction) => t.bookedAt && format(t.bookedAt, 'yyyy-MM-dd') === todayStr && t.amount < 0 && !t.deletedAt)
      .reduce((a, b) => a + Math.abs(b.amount), 0);
  }, [transactions]);

  const {monthUsed, monthLimit, remain, usageRate} = useMemo(() => {
    if (!budget || !budget.limits) return { monthUsed: 0, monthLimit: 0, remain: 0, usageRate: 0 };
    const used = Object.values(budget.used || {}).reduce((a, b) => a + b, 0);
    const limit = Object.values(budget.limits).reduce((a, b) => a + b, 0);
    const remain = Math.max(0, limit - used);
    const usageRate = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { monthUsed: used, monthLimit: limit, remain, usageRate };
  }, [budget]);
  
  const loading = propsLoading || layoutLoading;

  const handleSaveLayout = () => {
    setIsEditing(false);
    console.log("Saving layout:", localLayout);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading || !localLayout) {
      return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
              <div className="md:col-span-6 flex justify-end gap-2 mb-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-48 md:col-span-6" />
              <Skeleton className="h-24 md:col-span-3" />
              <Skeleton className="h-24 md:col-span-3" />
          </div>
      )
  }

  const sortedWidgets = localLayout.widgets.sort((a, b) => a.order - b.order);

  const widgetProps = {
      todaySpend: { todaySpend, setTab },
      monthlyBudget: { remain, usageRate, monthUsed },
      advice: { transactions, budget },
      quickActions: { onOpenGoalForm, setTab },
      goals: { goals },
      recentTransactions: { transactions },
  };

  return (
    <div>
        <div className="flex justify-end gap-2 mb-4">
            {isEditing ? (
                <>
                    <Button onClick={handleCancelEdit} variant="ghost">キャンセル</Button>
                    <Button onClick={handleSaveLayout}>
                        <Save className="h-4 w-4 mr-2" />
                        レイアウトを保存
                    </Button>
                </>
            ) : (
                <>
                    <Button onClick={() => onOpenTransactionForm()} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        手入力
                    </Button>
                    <Button onClick={onOpenOcr}>
                        <ScanLine className="h-4 w-4 mr-2" />
                        レシート読取
                    </Button>
                    <Button onClick={() => setIsEditing(true)} variant="outline" disabled>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        編集
                    </Button>
                </>
            )}
        </div>

        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">タスク</h2>
            <TasksOverview tasks={tasks} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {sortedWidgets.map((widget) => {
                const WidgetComponent = WidgetMap[widget.id];
                if (!WidgetComponent) return null;

                const componentProps = widgetProps[widget.id] as any;
                const className = sizeToClassMap[widget.size] || 'md:col-span-6';

                const widgetContent = <WidgetComponent {...componentProps} />;

                return (
                    <div key={widget.id} className={className}>
                        {widgetContent}
                    </div>
                )
            })}
        </div>
    </div>
  );
}
