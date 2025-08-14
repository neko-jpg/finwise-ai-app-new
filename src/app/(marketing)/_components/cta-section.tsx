
'use client';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32">
        <m.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center px-6"
        >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                さあ、未来の家計管理を<br />今すぐ始めよう。
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/70">
                登録は簡単。今日からあなたの財務アシスタントが、最適な家計管理をサポートします。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="rounded-full bg-mk-accent text-white hover:bg-opacity-80 transition shadow-lg text-base font-semibold px-8 py-6">
                    <Link href="/entry">無料で始める</Link>
                </Button>
            </div>
      </m.div>
    </section>
  );
}
