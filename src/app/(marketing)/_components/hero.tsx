
'use client';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const MotionBg = dynamic(() => import('./motion-bg'), { ssr: false });

export function Hero() {
  return (
    <section 
        className="relative flex h-screen min-h-[700px] items-center justify-center text-center overflow-hidden"
    >
        <MotionBg />
      <div className="relative z-10 px-6">
        <m.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }} 
            className="text-4xl font-black leading-tight tracking-[-0.033em] text-white sm:text-6xl"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
        >
            Unlock Financial Clarity with AI
        </m.h1>
        <m.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }} 
            className="mt-6 max-w-2xl mx-auto text-lg text-white/80"
        >
            Experience the future of personal finance with our AI-powered app. Effortlessly manage your money, gain insights, and achieve your financial goals.
        </m.p>
        <m.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }} 
            className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-mk-accent text-mk-bg-1 hover:bg-mk-accent/80 transition-transform active:scale-95 text-base font-bold shadow-lg">
            <Link href="/entry">Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-mk-secondary text-white hover:bg-mk-secondary/80 transition-transform active:scale-95 text-base font-bold">
            <Link href="#demo">Watch Demo</Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}
