
'use client';

import { QUICK_ACTIONS } from "@/data/dummy-data";
import { useTranslations } from "next-intl";

interface QuickActionsProps {
    onOpenGoalForm: () => void;
    setTab: (tab: string) => void;
}

function QAButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void; }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition-transform">
      <span className="opacity-80">{icon}</span>
      <span>{label}</span>
    </button>
  );
}


export function QuickActions({ onOpenGoalForm, setTab }: QuickActionsProps) {
  const t = useTranslations('QuickActions');
  const handleActionClick = (actionKey: string) => {
    switch (actionKey) {
      case 'create_goal':
        onOpenGoalForm();
        break;
      case 'detect_subscription':
        setTab('subscriptions');
        break;
      case 'review_fixed_costs':
        setTab('reviews');
        break;
      case 'link_bank':
        setTab('link');
        break;
      default:
        break;
    }
  };

  return (
    <div className="md:col-span-3 mt-4">
        <h2 className="font-headline text-lg font-semibold mb-3">{t('title')}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
            <QAButton
                key={action.key}
                icon={<action.icon className="h-4 w-4" />}
                label={action.text}
                onClick={() => handleActionClick(action.key)}
            />
        ))}
        </div>
    </div>
  );
}
