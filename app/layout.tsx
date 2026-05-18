// E:\pasto-sano\app\layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter, Archivo } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#111111',
};

export const metadata: Metadata = {
  title: 'Pasto Sano — Pasti pronti, cucinati a Verona. Pronti in 2 minuti.',
  description:
    'Pasti freschi preparati ogni mattina a Verona da Andrea Padoan, Personal Trainer dal 2013. Macro chiari, porzioni calibrate, ritiro in Via Albere. Da €6,50.',
  keywords:
    'pasto sano verona, pasti pronti verona, meal prep verona, pasti fitness, andrea padoan, tribu studio, pasti proteici, cibo sano verona',
  authors: [{ name: 'Andrea Padoan' }],
  creator: 'Pasto Sano',
  publisher: 'Pasto Sano',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.pastosano.it'),
  openGraph: {
    title: 'Pasto Sano — Mangia come un PT. Senza cucinare.',
    description:
      'Pasti freschi preparati ogni mattina a Verona. Macro chiari, porzioni calibrate, ritiro in Via Albere. Da €6,50.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.pastosano.it',
    siteName: 'Pasto Sano',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pasto Sano — Pasti pronti cucinati a Verona',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasto Sano — Mangia come un PT. Senza cucinare.',
    description: 'Pasti freschi cucinati ogni mattina a Verona. Ritiro in Via Albere.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${inter.variable} ${archivo.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
