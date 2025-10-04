import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Pasto Sano - Pasti Salutari a Domicilio',
  description: 'Ordina pasti sani e bilanciati con consegna a domicilio. Ingredienti freschi e di qualità per il tuo benessere quotidiano.',
  keywords: 'pasti sani, consegna a domicilio, cibo salutare, meal prep, pasti bilanciati, consegna pasti',
  authors: [{ name: 'Pasto Sano' }],
  creator: 'Pasto Sano',
  publisher: 'Pasto Sano',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pastosano.vercel.app'),
  openGraph: {
    title: 'Pasto Sano - Pasti Salutari a Domicilio',
    description: 'Ordina pasti sani e bilanciati con consegna a domicilio',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://pastosano.vercel.app',
    siteName: 'Pasto Sano',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pasto Sano - Pasti Salutari',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasto Sano - Pasti Salutari a Domicilio',
    description: 'Ordina pasti sani e bilanciati con consegna a domicilio',
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
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}