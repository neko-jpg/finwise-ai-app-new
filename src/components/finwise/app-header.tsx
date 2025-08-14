import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Settings, PiggyBank, Plus } from "lucide-react";

interface AppHeaderProps {
  onOpenVoice: () => void;
  onOpenSettings: () => void;
}

export function AppHeader({ onOpenVoice, onOpenSettings }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold">Finwise AI</h1>
          <Badge variant="outline" className="ml-2 border-primary/50 text-primary">PWA</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onOpenVoice} aria-label="Open voice assistant">
            <Mic className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
