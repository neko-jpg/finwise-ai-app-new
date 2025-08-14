import { Button } from "@/components/ui/button";
import { Home, List, PiggyBank, Target, Mic } from "lucide-react";

export function BottomNav({ tab, setTab, onMic }: { tab: string; setTab: (t: string) => void; onMic: () => void }) {
  const navItems = [
    { key: "home", label: "ホーム", Icon: Home, path: '/' },
    { key: "tx", label: "明細", Icon: List, path: '/transactions' },
    { key: "budget", label: "予算", Icon: PiggyBank, path: '/budget' },
    { key: "goals", label: "目標", Icon: Target, path: '/goals' },
  ];

  const NavItem = ({ itemKey, label, Icon }: { itemKey: string; label: string; Icon: React.ElementType }) => (
    <button
      onClick={() => setTab(itemKey)}
      aria-current={tab === itemKey}
      className={`flex flex-1 flex-col items-center justify-center py-2 text-xs transition-colors duration-200 ${tab === itemKey ? "text-primary font-medium" : "text-muted-foreground hover:text-primary/80"}`}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span>{label}</span>
    </button>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-around">
        {navItems.slice(0, 2).map(item => <NavItem key={item.key} itemKey={item.key} label={item.label} Icon={item.Icon} />)}
        
        <div className="flex-shrink-0">
            <Button
                onClick={onMic}
                aria-label="Open voice assistant"
                className="relative -top-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                <Mic className="h-7 w-7" />
            </Button>
        </div>

        {navItems.slice(2).map(item => <NavItem key={item.key} itemKey={item.key} label={item.label} Icon={item.Icon} />)}
      </div>
    </footer>
  );
}
