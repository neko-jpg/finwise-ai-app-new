
'use client';

import { PiggyBank } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FinwiseLogo } from "./logo";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
];

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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <FinwiseLogo className="size-6 text-mk-accent" />
          <h1 className="text-xl font-bold text-white tracking-tighter">FinAI</h1>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-6">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-white/80 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="secondary" className="bg-mk-secondary text-white hover:bg-mk-secondary/80 font-bold">
                    <Link href="#demo">Watch Demo</Link>
                </Button>
                 <Button asChild className="bg-mk-accent text-mk-bg-1 hover:bg-mk-accent/90 font-bold">
                    <Link href="/entry">Get Started Free</Link>
                </Button>
            </div>
        </nav>
      </div>
    </header>
  );
}
