
'use client';

import { Button } from "@/components/ui/button";
import { QUICK_ACTIONS } from "@/data/dummy-data";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
    onOpenGoalForm: () => void;
}


export function QuickActions({ onOpenGoalForm }: QuickActionsProps) {
  const { toast } = useToast();

  const handleActionClick = (actionKey: string) => {
    switch (actionKey) {
      case 'create_goal':
        onOpenGoalForm();
        break;
      case 'detect_subscription':
      case 'link_bank':
      case 'review_fixed_costs':
        toast({
          title: "機能は現在開発中です",
          description: "今後のアップデートにご期待ください！",
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="md:col-span-3 mt-4">
        <h2 className="font-headline text-lg font-semibold mb-3">クイックアクション</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
            <Button 
                key={action.key} 
                variant="secondary" 
                className="justify-start gap-2 h-12 text-left"
                onClick={() => handleActionClick(action.key)}
            >
                <action.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-normal">{action.text}</span>
            </Button>
        ))}
        </div>
    </div>
  );
}
