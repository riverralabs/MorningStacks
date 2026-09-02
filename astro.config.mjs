import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { sitemapExcludeFragments } from './src/lib/sitemap-excludes';

const SITE = process.env.SITE_URL ?? 'https://morningstacks.com';
const exclude = sitemapExcludeFragments();

export default defineConfig({
  site: SITE,
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: false,
    isr: false,
  }),
  integrations: [
    react(),
    mdx(),
    keystatic(),
    sitemap({
      filter: (page) => !exclude.some((fragment) => page.includes(fragment)),
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
