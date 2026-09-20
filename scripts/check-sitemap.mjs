#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalUrl, CANONICAL_SITE_URL } from '../src/lib/site-url.ts';
import {
  articleLastmodByUrl,
  articlePath,
  isPublishedOnSitemap,
  loadArticleSitemapRecords,
} from '../src/lib/sitemap.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staticDir = join(root, '.vercel/output/static');
const indexPath = join(staticDir, 'sitemap-index.xml');
const urlsetPath = join(staticDir, 'sitemap-0.xml');
const errors = [];

function fail(message) {
  errors.push(message);
}

if (!existsSync(indexPath) || !existsSync(urlsetPath)) {
  console.error(
    'Sitemap files missing. Run `pnpm build` first. Expected sitemap-index.xml and sitemap-0.xml in .vercel/output/static/.',
  );
  process.exit(1);
}

const indexXml = readFileSync(indexPath, 'utf8');
const urlsetXml = readFileSync(urlsetPath, 'utf8');

if (!indexXml.includes(`${CANONICAL_SITE_URL}/sitemap-0.xml`)) {
  fail(`sitemap-index.xml must point at ${CANONICAL_SITE_URL}/sitemap-0.xml`);
}

if (/https:\/\/morningstacks\.com(?!\/)/.test(urlsetXml) || urlsetXml.includes('https://morningstacks.com/')) {
  fail('sitemap loc entries must not use the apex host');
}

const urlBlocks = [...urlsetXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
if (urlBlocks.length === 0) fail('sitemap-0.xml has no <url> entries');

const locs = [];
for (const block of urlBlocks) {
  const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if (!loc) {
    fail('sitemap url entry missing <loc>');
    continue;
  }
  locs.push(loc);
  if (!loc.startsWith(`${CANONICAL_SITE_URL}/`)) {
    fail(`loc is not on the canonical host: ${loc}`);
  }
  const path = new URL(loc).pathname;
  const last = path.split('/').filter(Boolean).pop() ?? '';
  const isFile = /\.[a-z0-9]{1,8}$/i.test(last);
  if (!isFile && !path.endsWith('/')) {
    fail(`HTML loc is missing a trailing slash: ${loc}`);
  }
  if (canonicalUrl(path, CANONICAL_SITE_URL) !== loc) {
    fail(`loc does not match canonical(): ${loc} vs ${canonicalUrl(path, CANONICAL_SITE_URL)}`);
  }
}

const banned = ['/keystatic', '/api/', '/og/', '/search', '/affiliate-disclosure'];
for (const loc of locs) {
  if (banned.some((fragment) => loc.includes(fragment))) {
    fail(`non-indexable URL in sitemap: ${loc}`);
  }
}

const records = loadArticleSitemapRecords();
const published = records.filter(isPublishedOnSitemap);
const lastmods = articleLastmodByUrl(CANONICAL_SITE_URL, records);
const locSet = new Set(locs);

for (const record of published) {
  const path = articlePath(record);
  if (!path) {
    fail(`published article ${record.slug} is missing a category`);
    continue;
  }
  const loc = `${CANONICAL_SITE_URL}${path}`;
  if (!locSet.has(loc)) fail(`published article missing from sitemap: ${loc}`);
  const block = urlBlocks.find((entry) => entry.includes(`<loc>${loc}</loc>`));
  const lastmod = block?.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  const expected = lastmods.get(loc);
  if (!expected) {
    fail(`no lastmod mapped for ${loc}`);
    continue;
  }
  if (!lastmod || !lastmod.startsWith(expected)) {
    fail(`lastmod for ${loc} should start with ${expected}, got ${lastmod ?? 'missing'}`);
  }
}

if (!locSet.has(`${CANONICAL_SITE_URL}/`)) fail('homepage missing from sitemap');
if (!locSet.has(`${CANONICAL_SITE_URL}/disclosure/`)) fail('/disclosure/ missing from sitemap');

if (errors.length) {
  console.error(`Sitemap check failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.info(`Sitemap OK: ${locs.length} URLs in sitemap-0.xml, ${published.length} published articles with lastmod.`);
