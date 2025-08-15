
'use client';

// This is a client-side layout for framer-motion animations.
import AnimationProvider from '@/components/animation-provider';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimationProvider>{children}</AnimationProvider>;
}
