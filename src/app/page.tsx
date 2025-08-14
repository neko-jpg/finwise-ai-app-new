'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    const browserLanguage = navigator.language.split('-')[0];
    const newLocale = browserLanguage === 'ja' ? '/ja' : '/en';
    redirect(newLocale);
  }, []);

  return null;
}
