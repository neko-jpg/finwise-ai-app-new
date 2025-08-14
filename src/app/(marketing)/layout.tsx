
'use client';
import { MarketingHeader } from './_components/header';
import { MarketingFooter } from './_components/footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-body font-headline">
        <MarketingHeader />
        {children}
        <MarketingFooter />
    </div>
  );
}
