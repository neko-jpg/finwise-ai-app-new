
'use client';

import { Hero } from "./_components/hero";
import { ValueCards } from "./_components/value-cards";
import { SocialProof } from "./_components/social-proof";
import { CtaSection } from "./_components/cta-section";
import { ScrollDemo } from "./_components/scroll-demo";

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <ValueCards />
      <SocialProof />
      <ScrollDemo />
      <CtaSection />
    </>
  );
}
