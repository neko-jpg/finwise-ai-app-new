
import "../lib/env";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Noto_Sans_JP } from 'next/font/google';
import AnimationProvider from '@/components/animation-provider';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const noto = Noto_Sans_JP({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable}`}>
      <body className="font-body">
           <AnimationProvider>
              {children}
            </AnimationProvider>
          <Toaster />
      </body>
    </html>
  );
}
