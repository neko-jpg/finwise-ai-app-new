
'use client';

import { useAuthState } from "@/hooks/use-auth-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Hero } from './_components/hero';
import { ValueCards } from './_components/value-cards';
import { ScrollDemo } from './_components/scroll-demo';
import { SocialProof } from './_components/social-proof';
import { CtaSection } from './_components/cta-section';

export default function LandingPage() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/app');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the marketing page.
  // The CTA buttons will lead to /entry.
  if (!user) {
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

  // This case should ideally not be reached if the redirect works,
  // but as a fallback, we show a loader.
  return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
          <div className="flex flex-col items-center gap-4">
              <Loader className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">リダイレクト中...</p>
          </div>
      </div>
  );
}
