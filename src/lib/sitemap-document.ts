import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CANONICAL_SITE_URL } from './site-url.ts';
import {
  articleLastmodByUrl,
  articlePath,
  isPublishedOnSitemap,
  loadArticleSitemapRecords,
} from './sitemap.ts';

const STATIC_PATHS = [
  '/',
  '/about/',
  '/archive/',
  '/contact/',
  '/disclosure/',
  '/methodology/',
  '/newsletter/',
  '/privacy/',
  '/terms/',
];

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function categoryPaths(): string[] {
  const dir = join(process.cwd(), 'src/content/categories');
  try {
    return readdirSync(dir)
      .filter((file) => /\.mdx?$/.test(file))
      .map((file) => `/${file.replace(/\.mdx?$/, '')}/`)
      .sort();
  } catch {
    return [];
  }
}

export function sitemapEntries(): { loc: string; lastmod?: string }[] {
  const origin = CANONICAL_SITE_URL.replace(/\/$/, '');
  const records = loadArticleSitemapRecords();
  const lastmods = articleLastmodByUrl(origin, records);
  const pages = [...STATIC_PATHS, ...categoryPaths()].map((path) => ({
    loc: `${origin}${path}`,
  }));
  const articles = records.filter(isPublishedOnSitemap).flatMap((record) => {
    const path = articlePath(record);
    if (!path) return [];
    const loc = `${origin}${path}`;
    const lastmod = lastmods.get(loc);
    return [{ loc, ...(lastmod ? { lastmod } : {}) }];
  });
  return [...pages, ...articles].sort((a, b) => a.loc.localeCompare(b.loc));
}

export function renderSitemapUrlset(entries = sitemapEntries()): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
      return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmod}</url>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function renderSitemapIndex(): string {
  const loc = `${CANONICAL_SITE_URL}/sitemap-0.xml`;
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${escapeXml(loc)}</loc></sitemap></sitemapindex>`;
}
