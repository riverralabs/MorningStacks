import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    absolute: `${SITE.name} · ${SITE.tagline}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/favicon.svg',
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
      'text/plain': '/llms.txt',
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[var(--color-page)]">
      <head>
        <meta name="theme-color" content="#FAF4E8" />
        <meta name="color-scheme" content="light" />
        <link rel="sitemap" href="/sitemap-index.xml" />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/lora-latin.woff2" crossOrigin="" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/space-grotesk-latin.woff2"
          crossOrigin=""
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-[var(--color-page)] text-[var(--color-ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
