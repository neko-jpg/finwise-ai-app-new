
import { Hero } from './_components/hero';
import { ValueCards } from './_components/value-cards';
import { ScrollDemo } from './_components/scroll-demo';
import { SocialProof } from './_components/social-proof';
import { CtaSection } from './_components/cta-section';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ValueCards />
      <ScrollDemo />
      <SocialProof />
      <CtaSection />
    </>
  );
}
