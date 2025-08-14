
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Noto_Sans_JP, Plus_Jakarta_Sans } from 'next/font/google';
import { AnimatePresence, m } from 'framer-motion';


const noto = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta-sans',
  display: 'swap',
});


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${noto.variable} ${jakarta.variable}`}>
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
