
'use client';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section 
        className="relative flex h-screen min-h-[700px] items-center justify-center text-center overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10"
        style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://images.unsplash.com/photo-1554224155-8d04421cd6e2?q=80&w=2940&auto=format&fit=crop")',
        }}
        data-ai-hint="finance planning"
      />
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
          <Button asChild size="lg" className="bg-mk-accent text-mk-bg-1 hover:bg-mk-accent/90 transition-transform active:scale-95 text-base font-bold shadow-lg shadow-black/30">
            <Link href="/entry">Get Started Free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-mk-secondary text-white hover:bg-mk-secondary/80 transition-transform active:scale-95 text-base font-bold shadow-lg shadow-black/30">
            <Link href="#demo">Watch Demo</Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}
