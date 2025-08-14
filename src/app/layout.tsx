import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Noto_Sans_JP, Plus_Jakarta_Sans } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Finwise AI - Personal Finance Manager',
  description: 'AI-powered personal finance manager to analyze spending, plan budgets, and get real-time saving tips.',
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${noto.variable} ${jakarta.variable} dark`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
