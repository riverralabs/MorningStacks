import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

const SITE = process.env.SITE_URL ?? 'https://morningstacks.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: false,
    isr: false,
  }),
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/og/'),
    }),
  ],
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['@resvg/resvg-js', 'satori', 'sharp'],
    },
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
