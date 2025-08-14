
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Noto_Sans_JP } from 'next/font/google';
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
      <body className="font-body">
           <AnimatePresence mode="wait">
              <m.main 
                  key="main-app-wrapper"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                {children}
              </m.main>
            </AnimatePresence>
          <Toaster />
      </body>
    </html>
  );
}
