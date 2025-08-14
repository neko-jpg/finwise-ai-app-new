
'use client';

import { AppContainer } from '@/components/finwise/app-container';

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='dark font-body'>
      <AppContainer>
        {children}
      </AppContainer>
    </div>
  );
}
