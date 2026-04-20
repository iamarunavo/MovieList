import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AnalyticsInit from '@/components/AnalyticsInit';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LaxMovies | Browse Movies',
  description: 'LaxMovies — Discover trending films, top-rated picks, and save your favorites.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-base text-white min-h-screen`}>
        <AuthProvider>
          <AnalyticsInit />
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
