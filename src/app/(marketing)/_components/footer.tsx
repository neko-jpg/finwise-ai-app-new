
'use client';

import { Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';
import { FinwiseLogo } from './logo';

const socialLinks = [
    { name: 'Twitter', icon: Twitter },
    { name: 'Instagram', icon: Instagram },
    { name: 'Facebook', icon: Facebook },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-mk-secondary mt-24 bg-mk-bg-2">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
                <Link href="/" className="flex items-center gap-2 mb-2">
                    <FinwiseLogo className="size-7 text-mk-accent" />
                    <h1 className="text-2xl font-bold text-white tracking-tighter">FinAI</h1>
                </Link>
                <p className="text-mk-text text-sm max-w-xs text-center md:text-left">Smart finance, simplified.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:justify-end">
                <Link href="#" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-white/80 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="text-white/80 hover:text-white transition-colors">Contact Us</Link>
            </div>
        </div>
        <div className="mt-12 flex flex-col-reverse md:flex-row items-center justify-between gap-8 border-t border-mk-secondary pt-8">
            <p className="text-mk-text text-sm">&copy; {new Date().getFullYear()} FinAI. All rights reserved.</p>
            <div className="flex justify-center gap-6">
                {socialLinks.map(link => (
                    <Link key={link.name} href="#" aria-label={link.name} className="text-mk-text hover:text-white transition-colors">
                        <link.icon className="h-5 w-5"/>
                    </Link>
                ))}
            </div>
        </div>
      </div>
    </footer>
  );
}
