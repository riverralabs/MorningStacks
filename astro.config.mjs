import { defineConfig, envField } from 'astro/config';
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
  env: {
    schema: {
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
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
      customPages: [`${SITE.replace(/\/$/, '')}/llms.txt`, `${SITE.replace(/\/$/, '')}/rss.xml`],
    }),
  ],
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [
      {
        name: 'astro-env-server-stub',
        enforce: 'pre',
        resolveId(id) {
          if (id === 'astro:env/server') return '\0astro-env-server-stub';
        },
        load(id) {
          if (id === '\0astro-env-server-stub') {
            return 'export function getSecret(key) { return process.env[key]; }\n';
          }
        },
      },
      tailwindcss(),
    ],
    optimizeDeps: {
      exclude: ['@keystatic/astro', '@keystatic/core'],
    },
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
