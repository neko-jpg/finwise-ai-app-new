
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Receipt, FileUp, Building, LogIn, Plus } from "lucide-react";
import { AuthDialog } from '@/components/finwise/auth-dialog';


const MethodCard = ({ title, desc, icon, onClick, disabled = false }: { title: string; desc: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="group relative flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <div className="rounded-lg bg-primary/10 p-2 text-primary">
      {icon}
    </div>
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-sm text-white/60">{desc}</p>
  </button>
);


export function EntryPage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  return (
    <>
      <main className="min-h-dvh bg-gradient-to-b from-[#0B1220] to-[#111827] text-white">
        <section className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">家計、話して、見える。</h1>
          <p className="mt-3 text-white/80">AIがあなたの支出を整理し、今日の一手を提案します。</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setAuthDialogOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              ログインまたは新規登録
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MethodCard title="手入力で試す" desc="最短30秒で1件登録" icon={<Plus />} onClick={() => setAuthDialogOpen(true)} />
            <MethodCard title="レシートOCR" desc="写真から自動読取" icon={<Receipt />} onClick={() => {}} disabled />
            <MethodCard title="CSVインポート" desc="銀行・カード明細を一括" icon={<FileUp />} onClick={() => {}} disabled />
            <MethodCard title="口座連携" desc="自動で取り込み（将来）" icon={<Building />} disabled />
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-white/60">
            <Mic className="h-5 w-5" />
            <span>「カフェ 580円」と話しかけてもOK（後から設定可能）</span>
          </div>
        </section>
      </main>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
