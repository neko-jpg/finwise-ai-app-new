
'use client';
import { AnimatePresence, m } from 'framer-motion';
import { MarketingHeader } from './_components/header';
import { MarketingFooter } from './_components/footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
        <m.main 
            key="marketing-main"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="marketing-body font-headline"
        >
            <MarketingHeader />
            {children}
            <MarketingFooter />
        </m.main>
    </AnimatePresence>
  );
}
