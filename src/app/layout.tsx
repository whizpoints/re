import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Whizpoint Flipbook | Digital Document Platform',
  description: 'Transform your print-ready PDFs into beautiful, ultra-modern, interactive digital flipbooks instantly. Host, share, and track your documents securely with Whizpoint.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Whizpoint Flipbook | Digital Document Platform',
    description: 'Transform your print-ready PDFs into beautiful, ultra-modern, interactive digital flipbooks instantly. Host, share, and track your documents securely with Whizpoint.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app',
    siteName: 'Whizpoint Flipbook',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Whizpoint Flipbook',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whizpoint Flipbook | Digital Document Platform',
    description: 'Transform your print-ready PDFs into beautiful, ultra-modern, interactive digital flipbooks instantly.',
    site: '@whizpoint',
    images: ['/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '8px' } }} />
        {children}
      </body>
    </html>
  );
}
