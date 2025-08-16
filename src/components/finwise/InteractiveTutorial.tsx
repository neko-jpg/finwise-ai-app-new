'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BotMessageSquare } from "lucide-react";

interface InteractiveTutorialProps {
  onStartOcr: () => void;
  onComplete: () => void;
}

export function InteractiveTutorial({ onStartOcr, onComplete }: InteractiveTutorialProps) {
  const handleStart = () => {
    onStartOcr();
    onComplete(); // For this simple first step, we complete it immediately.
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 z-50">
        <Card className="bg-primary-foreground border-primary/20 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <BotMessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">Finwise AI アシスタント</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            こんにちは！まずはレシートを撮影してみませんか？支出を自動で読み取ります。
                        </p>
                        <Button onClick={handleStart} className="w-full">
                            <Sparkles className="h-4 w-4 mr-2" />
                            はい、やってみます！
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
