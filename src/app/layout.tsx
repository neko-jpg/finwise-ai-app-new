
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Noto_Sans_JP, Inter } from 'next/font/google';


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
      <body>
          {children}
          <Toaster />
      </body>
    </html>
  );
}
