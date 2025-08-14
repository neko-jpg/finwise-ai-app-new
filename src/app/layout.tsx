
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Noto_Sans_JP, Plus_Jakarta_Sans } from 'next/font/google';


const noto = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${noto.variable} ${jakarta.variable} dark`}>
      <body>
          {children}
          <Toaster />
      </body>
    </html>
  );
}
