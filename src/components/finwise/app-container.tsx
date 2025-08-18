'use client';

import React from 'react';
import { AppHeader } from './app-header';
import { OfflineBanner } from './offline-banner';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { BottomNav } from './bottom-nav';
import { useRouter, usePathname } from 'next/navigation';
import { AppDataProvider, useAppData } from '@/contexts/app-data-context';

function AppContainerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, setVoiceOpen } = useAppData();
  const isOnline = useOnlineStatus();

  const activeTab = React.useMemo(() => {
    const path = pathname.split('/').pop() || 'dashboard';
    if (
      [
        'transactions',
        'budget',
        'goals',
        'rules',
        'profile',
        'link',
        'subscriptions',
        'reviews',
        'dashboard',
      ].includes(path)
    ) {
      return path === 'dashboard' ? 'home' : path;
    }
    return 'home';
  }, [pathname]);

  const handleNavigation = (path: string) => {
    const finalPath = path === 'home' ? '/dashboard' : `/dashboard/${path}`;
    router.push(finalPath);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader onOcr={() => {}} notifications={notifications} />
      {!isOnline && <OfflineBanner />}
      <main className="flex-1 pb-24 pt-16">{children}</main>
      <BottomNav
        tab={activeTab}
        setTab={handleNavigation}
        onMic={() => setVoiceOpen(true)}
      />
    </div>
  );
}

export function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <AppContainerLayout>{children}</AppContainerLayout>
    </AppDataProvider>
  );
}
