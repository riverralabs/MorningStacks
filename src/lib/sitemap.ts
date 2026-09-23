import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ArticleSitemapRecord = {
  slug: string;
  category?: string;
  status?: string;
  unlisted: boolean;
  seed: boolean;
  draft: boolean;
  date?: string;
  updated?: string;
};

const STATIC_EXCLUDE_PATHS = [
  '/keystatic',
  '/api/',
  '/og/',
  '/search',
  '/go/',
  '/affiliate-disclosure',
];

/** YYYY-MM-DD only. Google uses lastmod when it matches a real content change. */
export function toSitemapDate(value: string): string | undefined {
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
}

export function parseArticleSitemapRecord(filename: string, src: string): ArticleSitemapRecord {
  const fm = src.split('---')[1] ?? '';
  const status = fm.match(/^\s*status:\s*(\S+)/m)?.[1];
  const unlistedFlag = /^\s*unlisted:\s*true\s*$/m.test(fm);
  const seed = /^\s*seed:\s*true\s*$/m.test(fm);
  const draft = status === 'draft' || /^\s*draft:\s*true\s*$/m.test(fm);
  const unlisted = status === 'unlisted' || unlistedFlag;
  return {
    slug: filename.replace(/\.mdx?$/, ''),
    category: fm.match(/^\s*category:\s*(\S+)/m)?.[1],
    status,
    unlisted,
    seed,
    draft,
    date: fm.match(/^\s*date:\s*(\S+)/m)?.[1],
    updated: fm.match(/^\s*updated:\s*(\S+)/m)?.[1],
  };
}

export function isUnlistedOnSitemap(record: ArticleSitemapRecord): boolean {
  return record.unlisted && !record.seed && !record.draft;
}

export function isPublishedOnSitemap(record: ArticleSitemapRecord): boolean {
  return record.status === 'published' && !record.seed && !record.draft && !record.unlisted;
}

export function articlePath(record: ArticleSitemapRecord): string | undefined {
  if (!record.category) return undefined;
  return `/${record.category}/${record.slug}/`;
}

export function lastmodForRecord(record: ArticleSitemapRecord): string | undefined {
  const raw = record.updated || record.date;
  return raw ? toSitemapDate(raw) : undefined;
}

export function loadArticleSitemapRecords(
  dir = join(process.cwd(), 'src/content/articles'),
): ArticleSitemapRecord[] {
  try {
    return readdirSync(dir)
      .filter((file) => /\.mdx?$/.test(file))
      .map((file) => parseArticleSitemapRecord(file, readFileSync(join(dir, file), 'utf8')));
  } catch {
    return [];
  }
}

/**
 * Path fragments to keep out of the generated sitemap. Draft/seed entries
 * are not built, so they never appear. Unlisted entries *are* built (for
 * preview) and must be filtered here.
 */
export function sitemapExcludeFragments(
  records: ArticleSitemapRecord[] = loadArticleSitemapRecords(),
): string[] {
  const fragments = [...STATIC_EXCLUDE_PATHS];
  for (const record of records) {
    if (!isUnlistedOnSitemap(record)) continue;
    const path = articlePath(record);
    if (path) fragments.push(path);
  }
  return fragments;
}

export function shouldIncludeSitemapPage(
  page: string,
  fragments: string[] = sitemapExcludeFragments(),
): boolean {
  return !fragments.some((fragment) => page.includes(fragment));
}

export function articleLastmodByUrl(
  origin: string,
  records: ArticleSitemapRecord[] = loadArticleSitemapRecords(),
): Map<string, string> {
  const base = origin.replace(/\/$/, '');
  const lastmods = new Map<string, string>();
  for (const record of records) {
    if (!isPublishedOnSitemap(record)) continue;
    const path = articlePath(record);
    const lastmod = lastmodForRecord(record);
    if (!path || !lastmod) continue;
    lastmods.set(`${base}${path}`, lastmod);
  }
  return lastmods;
}

export type SitemapSerializeItem = {
  url: string;
  lastmod?: string;
};

export function serializeSitemapItem<T extends SitemapSerializeItem>(
  item: T,
  lastmods: Map<string, string>,
): T {
  const lastmod = lastmods.get(item.url);
  if (!lastmod) return item;
  return { ...item, lastmod };
}
