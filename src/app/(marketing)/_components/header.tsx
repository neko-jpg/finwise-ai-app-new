
'use client';

import { PiggyBank } from "lucide-react";
import Link from 'next/link';

export function MarketingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-mk-bg-1/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-mk-accent" />
          <h1 className="text-xl font-bold">Finwise AI</h1>
        </Link>
        <div className="flex items-center gap-4">
            <Link href="#features" className="text-sm hidden md:block hover:text-mk-accent transition-colors">機能</Link>
            <Link href="#demo" className="text-sm hidden md:block hover:text-mk-accent transition-colors">デモ</Link>
            <Link href="#pricing" className="text-sm hidden md:block hover:text-mk-accent transition-colors">料金</Link>
            <Link href="/entry" className="rounded-full px-4 py-2 text-sm bg-mk-accent hover:bg-opacity-80 transition">
                無料で始める
            </Link>
        </div>
      </div>
    </header>
  );
}
