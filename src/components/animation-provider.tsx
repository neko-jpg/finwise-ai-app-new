
'use client';
import { AnimatePresence, motion as m } from 'framer-motion';

export default function AnimationProvider({
  children,
}: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <m.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </m.main>
    </AnimatePresence>
  );
}
