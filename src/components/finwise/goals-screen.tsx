
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, PlusCircle } from "lucide-react";
import type { Goal } from "@/domain";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";


interface GoalsScreenProps {
  goals?: Goal[];
  loading?: boolean;
  onOpenGoalForm?: () => void;
}


export function GoalsScreen({ goals = [], loading, onOpenGoalForm = () => {} }: GoalsScreenProps) {
  
  if (loading) {
      return (
          <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-10 w-40" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({length: 2}).map((_, i) => (
                      <Card key={i}>
                          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                          <CardContent className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-10 w-full" />
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="font-headline text-xl font-bold">目標</h2>
            <Button onClick={onOpenGoalForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                新しい目標を追加
            </Button>
        </div>
        
        {goals.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-bold">まだ目標がありません</h3>
                <p className="text-sm mt-1">最初の目標を設定して、貯金のモチベーションを上げましょう！</p>
                 <Button onClick={onOpenGoalForm} className="mt-4">目標を作成する</Button>
            </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((g) => {
            const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
            return (
            <Card key={g.id}>
                <CardHeader className="pb-3">
                    <CardTitle className="font-headline flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            {g.name}
                        </div>
                        {g.scope === 'personal' && <Badge variant="secondary">個人</Badge>}
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
                        {g.due && <span>期限: {format(g.due, 'yyyy/MM/dd')}</span>}
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
