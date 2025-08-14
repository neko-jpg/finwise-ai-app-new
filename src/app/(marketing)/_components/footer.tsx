
'use client';

import { PiggyBank } from 'lucide-react';
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                 <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="h-6 w-6 text-mk-accent" />
                    <h1 className="text-xl font-bold">Finwise AI</h1>
                </div>
                <p className="text-sm text-white/60">家計、話して、見える。</p>
            </div>
            <div>
                <h4 className="font-semibold mb-3">プロダクト</h4>
                <ul className="space-y-2 text-sm text-white/80">
                    <li><Link href="#features" className="hover:text-mk-accent">機能</Link></li>
                    <li><Link href="#demo" className="hover:text-mk-accent">デモ</Link></li>
                    <li><Link href="#pricing" className="hover:text-mk-accent">料金</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-3">サポート</h4>
                 <ul className="space-y-2 text-sm text-white/80">
                    <li><Link href="#" className="hover:text-mk-accent">お問い合わせ</Link></li>
                    <li><Link href="#" className="hover:text-mk-accent">よくある質問</Link></li>
                </ul>
            </div>
             <div>
                <h4 className="font-semibold mb-3">規約等</h4>
                 <ul className="space-y-2 text-sm text-white/80">
                    <li><Link href="#" className="hover:text-mk-accent">利用規約</Link></li>
                    <li><Link href="#" className="hover:text-mk-accent">プライバシーポリシー</Link></li>
                </ul>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/50">
            <p>&copy; {new Date().getFullYear()} Finwise AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
