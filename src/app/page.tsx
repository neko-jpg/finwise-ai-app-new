
import { Hero } from './(marketing)/_components/hero';
import { ValueCards } from './(marketing)/_components/value-cards';
import { ScrollDemo } from './(marketing)/_components/scroll-demo';
import { SocialProof } from './(marketing)/_components/social-proof';
import { CtaSection } from './(marketing)/_components/cta-section';

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
