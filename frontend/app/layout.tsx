import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    template: '%s | LankaCare',
    default: 'LankaCare — National Digital Health Platform',
  },
  description:
    'Find verified Sri Lankan government hospitals, discover healthcare services, check clinic availability, manage appointments and reduce waiting through one secure national platform.',
  keywords: ['Sri Lanka', 'hospital', 'healthcare', 'LankaCare', 'doctor', 'clinic', 'appointment'],
  authors: [{ name: 'LankaCare' }],
  openGraph: {
    title: 'LankaCare — National Digital Health Platform',
    description: 'Find hospitals, book appointments and manage your health journey.',
    type: 'website',
    locale: 'en_LK',
    siteName: 'LankaCare',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#071521' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
