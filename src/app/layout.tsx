
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';
import { Noto_Sans_JP } from 'next/font/google';
import { MarketingHeader } from './(marketing)/_components/header';
import { MarketingFooter } from './(marketing)/_components/footer';
import { AnimatePresence, m } from 'framer-motion';

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${noto.variable} ${inter.variable}`}>
      <body className="marketing-body font-headline">
          <MarketingHeader />
          <main>{children}</main>
          <MarketingFooter />
          <Toaster />
      </body>
    </html>
  );
}
