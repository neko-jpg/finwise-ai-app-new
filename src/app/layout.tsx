
import "../lib/env";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Noto_Sans_JP } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AnimationProvider from '@/components/animation-provider';
import { AuthProvider } from "@/contexts/AuthContext";


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
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable}`}>
      <body className="font-body">
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
              <AnimationProvider>
                {children}
                <Toaster />
              </AnimationProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
      </body>
    </html>
  );
}
