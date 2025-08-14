import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Settings, PiggyBank, Plus, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppHeaderProps {
  onOpenVoice: () => void;
  onOpenSettings: () => void;
}

function LanguageSwitcher() {
  const { toast } = useToast();
  return (
    <Button variant="ghost" size="icon" onClick={() => toast({title: "言語切替", description: "この機能は現在開発中です"})}>
      <Globe className="h-5 w-5"/>
      <span className="sr-only">Change Language</span>
    </Button>
  )
}

export function AppHeader({ onOpenVoice, onOpenSettings }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold">Finwise AI</h1>
          <Badge variant="outline" className="ml-2 border-primary/50 text-primary hidden sm:inline-flex">PWA</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOpenVoice} aria-label="Open voice assistant">
            <Mic className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
