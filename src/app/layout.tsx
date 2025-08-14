
import {NextIntlClientProvider} from 'next-intl';
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
  // 日本語メッセージを相対パスで直読み（config不要）
  const messages = (await import('../messages/ja.json')).default;

  return (
    <html lang="ja" className={`${noto.variable} ${jakarta.variable} dark`}>
      <body>
        <NextIntlClientProvider locale="ja" messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
