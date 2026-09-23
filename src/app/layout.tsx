import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { sans, serif } from './fonts';
import { SITE, homeTitle } from '~/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    absolute: homeTitle(),
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
      'text/plain': '/llms.txt',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#1E3A5F',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} bg-[var(--color-paper)]`}>
      <head>
        <link rel="sitemap" href="/sitemap-index.xml" />
      </head>
      <body className="flex min-h-dvh flex-col bg-[var(--color-paper)] text-[var(--color-ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
