
'use client';

import { PiggyBank } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? 'bg-mk-bg-1/80 backdrop-blur-lg border-b border-mk-secondary/20' : 'bg-transparent'
    )}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-mk-accent">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">FinAI</h1>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-9">
              <Link href="#features" className="text-sm font-medium leading-normal text-white transition-colors hover:text-mk-accent">Features</Link>
              <Link href="#demo" className="text-sm font-medium leading-normal text-white transition-colors hover:text-mk-accent">Demo</Link>
              <Link href="#pricing" className="text-sm font-medium leading-normal text-white transition-colors hover:text-mk-accent">Pricing</Link>
            </div>
            <div className="flex gap-2">
                <Button asChild variant="secondary" className="bg-mk-secondary text-white hover:bg-mk-secondary/80">
                    <Link href="#demo">Watch Demo</Link>
                </Button>
                 <Button asChild className="bg-mk-accent text-mk-bg-1 hover:bg-mk-accent/80">
                    <Link href="/entry">Get Started Free</Link>
                </Button>
            </div>
        </div>
      </div>
    </header>
  );
}
