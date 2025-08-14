
'use client';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const MotionBg = dynamic(() => import('./motion-bg'), { ssr: false });

export function Hero() {
  return (
    <section className="relative flex h-[90svh] items-center justify-center text-center overflow-hidden">
      <MotionBg />
      <div className="relative z-10 px-6">
        <m.h1 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: 'easeOut' }} 
            className="text-5xl md:text-7xl font-extrabold tracking-tighter"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
            家計、話して、見える。
        </m.h1>
        <m.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }} 
            className="mt-4 max-w-xl mx-auto text-lg text-white/80"
        >
            AIがあなたの支出を整理し、今日の一手を提案します。
        </m.p>
        <m.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.35, duration: 0.6 }} 
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="rounded-full bg-mk-accent text-white hover:bg-opacity-80 transition shadow-lg text-base font-semibold px-8 py-6">
            <Link href="/entry">無料で始める</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 text-base font-semibold px-8 py-6 backdrop-blur-sm">
            <Link href="#demo">デモを見る</Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}
