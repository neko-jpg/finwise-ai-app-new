import { Button } from "@/components/ui/button";
import { QUICK_ACTIONS } from "@/data/dummy-data";

export function QuickActions() {
  return (
    <div className="md:col-span-3 mt-4">
        <h2 className="font-headline text-lg font-semibold mb-3">クイックアクション</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_ACTIONS.map((action, idx) => (
            <Button key={idx} variant="secondary" className="justify-start gap-2 h-12 text-left">
            <action.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-normal">{action.text}</span>
            </Button>
        ))}
        </div>
    </div>
  );
}
