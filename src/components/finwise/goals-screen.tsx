import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, PlusCircle } from "lucide-react";
import { DEMO_GOALS } from "@/data/dummy-data";

export function GoalsScreen() {
  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">目標</h2>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                新しい目標を追加
            </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DEMO_GOALS.map((g, i) => {
            const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
            return (
            <Card key={i}>
                <CardHeader className="pb-3">
                    <CardTitle className="font-headline flex items-center gap-2 text-base">
                        <Target className="h-5 w-5 text-primary" />
                        {g.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-2 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">達成済</span>
                            <span className="font-medium">¥{g.saved.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">目標</span>
                            <span className="font-medium">¥{g.target.toLocaleString()}</span>
                        </div>
                    </div>
                    <Progress value={pct} className="h-3" />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>{pct}% 達成</span>
                        <span>期限: {g.due}</span>
                    </div>
                
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Button variant="secondary" className="flex-1">毎週の自動積立を提案</Button>
                        <Button variant="outline" className="flex-1">配分ルールを編集</Button>
                    </div>
                </CardContent>
            </Card>
            );
        })}
        </div>
    </div>
  );
}
