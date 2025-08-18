'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RuleForm } from '@/components/finwise/RuleForm';
import { Plus } from 'lucide-react';

export default function RulesPage() {
  // In a future step, we will fetch and display the actual rules here.
  const rules = [];
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-headline">分類ルール管理</h1>
            <p className="text-muted-foreground">
              取引が自動的に分類されるように、カスタムルールを作成・管理します。
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規ルール作成
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>マイルール一覧</CardTitle>
            <CardDescription>ルールは優先度が高い順（番号が小さい順）に適用されます。</CardDescription>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="font-semibold">まだルールがありません</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  「新規ルール作成」ボタンから、最初のルールを作成しましょう。
                </p>
              </div>
            ) : (
              <div>
                {/* This is where the list of rules will be rendered in a future step. */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <RuleForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </>
  );
}
