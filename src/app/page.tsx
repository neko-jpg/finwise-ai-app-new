
'use client';

import { useAuthState } from "@/hooks/use-auth-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Hero } from './(marketing)/_components/hero';
import { ValueCards } from './(marketing)/_components/value-cards';
import { ScrollDemo } from './(marketing)/_components/scroll-demo';
import { CtaSection } from './(marketing)/_components/cta-section';
import { SocialProof } from "./(marketing)/_components/social-proof";

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

  return (
      <div className="flex h-screen w-screen items-center justify-center bg-background dark">
          <div className="flex flex-col items-center gap-4">
              <Loader className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">リダイレクト中...</p>
          </div>
      </div>
  );
}
