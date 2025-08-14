import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";

export function AdviceCard() {
  return (
    <Card className="md:col-span-3 bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="font-headline flex items-center gap-2 text-lg text-primary">
          <Sparkles className="h-5 w-5" />
          今日の一手
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-base">「カフェ」を2回減らすと今週 +¥1,200 貯まります</p>
          <p className="text-sm text-muted-foreground mt-1">最近の支出パターンと予算進捗からのAI提案です</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="default" className="gap-1">
            実行する
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost">理由を見る</Button>
        </div>
      </CardContent>
    </Card>
  );
}
