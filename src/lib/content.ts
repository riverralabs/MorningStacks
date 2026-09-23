import 'server-only';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { isProgramName, isProgramStatus, type ProgramName, type ProgramStatus } from './affiliate';
import { isArticleType, type ArticleType } from './content-model';
import { articleHref, articleVisibility, isBuildable, isPublished, type Visibility } from './publish';
import { authorByline } from './byline';
import { readingMinutes } from './reading';

const reader = createReader(process.cwd(), keystaticConfig);

export type Faq = { q: string; a: string };
export type Source = { title: string; url?: string; checked: string };

export type Article = {
  slug: string;
  title: string;
  status: string;
  type: ArticleType;
  description: string;
  answer: string;
  eyebrow: string;
  category: string;
  authorSlug: string;
  date: string;
  updated: string | null;
  hero: string | null;
  heroAlt: string | null;
  og: string | null;
  ogAlt: string | null;
  ogTitle: string | null;
  products: string[];
  rating: number | null;
  lastTested: string | null;
  testMethod: string | null;
  ourPick: string | null;
  faq: Faq[];
  sources: Source[];
  related: string[];
  featured: boolean;
  seed: boolean;
  template: boolean;
  draft: boolean;
  unlisted: boolean;
  visibility: Visibility;
  href: string;
  readBody: () => Promise<string>;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  order: number;
  href: string;
};

export type Author = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  byline: string;
};

export type Product = {
  slug: string;
  name: string;
  vendor: string;
  category: string;
  summary: string;
  price: string;
  ourVerdict: string;
  pros: string[];
  cons: string[];
  rating: number;
  affiliateUrl: string;
  websiteUrl: string;
  program: ProgramName;
  programStatus: ProgramStatus;
  lastTested: string | null;
};

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function strOrNull(value: unknown): string | null {
  const text = str(value).trim();
  return text ? text : null;
}

function assetPublicUrl(relative: string | null): string | null {
  if (!relative) return null;
  const file = relative.split('/').pop();
  if (!file) return null;
  const article = relative.match(/articles\/([^/]+)\//);
  if (article) return `/media/articles/${article[1]}/${file}`;
  return null;
}

function mapArticle(slug: string, entry: Record<string, unknown>): Article | null {
  const type = str(entry.type);
  if (!isArticleType(type)) return null;
  const category = str(entry.category) || 'productivity';
  const visibilityInput = {
    seed: Boolean(entry.seed),
    status: strOrNull(entry.status),
    draft: Boolean(entry.draft),
    unlisted: Boolean(entry.unlisted),
  };
  return {
    slug,
    title: str(entry.title),
    status: str(entry.status),
    type,
    description: str(entry.description),
    answer: str(entry.answer),
    eyebrow: str(entry.eyebrow),
    category,
    authorSlug: str(entry.author),
    date: str(entry.date),
    updated: strOrNull(entry.updated),
    hero: assetPublicUrl(strOrNull(entry.hero)),
    heroAlt: strOrNull(entry.heroAlt),
    og: strOrNull(entry.og),
    ogAlt: strOrNull(entry.ogAlt),
    ogTitle: strOrNull(entry.ogTitle),
    products: Array.isArray(entry.products) ? entry.products.map(String) : [],
    rating: typeof entry.rating === 'number' ? entry.rating : null,
    lastTested: strOrNull(entry.lastTested),
    testMethod: strOrNull(entry.testMethod),
    ourPick: strOrNull(entry.ourPick),
    faq: Array.isArray(entry.faq)
      ? entry.faq.map((item) => {
          const row = item as { q?: string; a?: string };
          return { q: row.q ?? '', a: row.a ?? '' };
        })
      : [],
    sources: Array.isArray(entry.sources)
      ? entry.sources.map((item) => {
          const row = item as { title?: string; url?: string | null; checked?: string };
          return {
            title: row.title ?? '',
            url: row.url || undefined,
            checked: row.checked ?? '',
          };
        })
      : [],
    related: Array.isArray(entry.related) ? entry.related.map(String) : [],
    featured: Boolean(entry.featured),
    seed: Boolean(entry.seed),
    template: Boolean(entry.template),
    draft: Boolean(entry.draft),
    unlisted: Boolean(entry.unlisted),
    visibility: articleVisibility(visibilityInput),
    href: articleHref(category, slug),
    readBody: entry.body as () => Promise<string>,
  };
}

export const getArticles = cache(async (): Promise<Article[]> => {
  const all = await reader.collections.articles.all();
  return all
    .map((item) => mapArticle(item.slug, item.entry as unknown as Record<string, unknown>))
    .filter((item): item is Article => Boolean(item));
});

export const getPublishedArticles = cache(async (): Promise<Article[]> => {
  const articles = await getArticles();
  return articles
    .filter((article) => isPublished(article))
    .sort((a, b) => b.date.localeCompare(a.date));
});

export const getBuildableArticles = cache(async (): Promise<Article[]> => {
  const articles = await getArticles();
  return articles.filter((article) => isBuildable(article));
});

export const getReadingTimes = cache(async (): Promise<Map<string, number>> => {
  const articles = await getBuildableArticles();
  const entries = await Promise.all(
    articles.map(async (article) => [article.slug, readingMinutes(await article.readBody())] as const),
  );
  return new Map(entries);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const all = await reader.collections.categories.all();
  return all
    .map((item) => {
      const entry = item.entry as unknown as Record<string, unknown>;
      const slug = str(entry.slug) || item.slug;
      return {
        slug,
        name: str(entry.name),
        description: str(entry.description),
        order: typeof entry.order === 'number' ? entry.order : 0,
        href: `/${slug}/`,
      };
    })
    .sort((a, b) => a.order - b.order);
});

export const getAuthors = cache(async (): Promise<Author[]> => {
  const all = await reader.collections.authors.all();
  return all.map((item) => {
    const entry = item.entry as unknown as Record<string, unknown>;
    const name = str(entry.name);
    const role = str(entry.role);
    return {
      slug: item.slug,
      name,
      role,
      bio: str(entry.bio),
      byline: authorByline({ name, role }),
    };
  });
});

/**
 * Products are read from disk, not through the Keystatic reader. The reader
 * result includes `commissionNote`, and Next embeds that awaited value in the
 * page payload. The note stays in the file for the editor and never reaches HTML.
 */
function readProductFiles(): Product[] {
  const dir = join(process.cwd(), 'src/content/products');
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((name) => /\.mdx?$/.test(name));
  } catch {
    return [];
  }
  return files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const { scalars, pros, cons } = parseProductFrontmatter(fm);
    const program = scalars.program ?? '';
    const programStatus = scalars.status ?? '';
    const rating = Number(scalars.rating);
    return {
      slug: file.replace(/\.mdx?$/, ''),
      name: scalars.name ?? '',
      vendor: scalars.vendor ?? '',
      category: scalars.category ?? '',
      summary: scalars.summary ?? '',
      price: scalars.price ?? '',
      ourVerdict: scalars.ourVerdict ?? '',
      pros,
      cons,
      rating: Number.isFinite(rating) ? rating : 0,
      affiliateUrl: scalars.affiliateUrl ?? '',
      websiteUrl: scalars.websiteUrl ?? '',
      program: isProgramName(program) ? program : 'other',
      programStatus: isProgramStatus(programStatus) ? programStatus : 'none',
      lastTested: scalars.lastTested?.trim() ? scalars.lastTested : null,
    };
  });
}

function parseProductFrontmatter(fm: string): { scalars: Record<string, string>; pros: string[]; cons: string[] } {
  const lines = fm.split(/\r?\n/);
  const scalars: Record<string, string> = {};
  const lists: Record<string, string[]> = {};
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    const match = line.match(/^([A-Za-z0-9]+):\s*(.*)$/);
    if (!match) {
      index += 1;
      continue;
    }
    const key = match[1] ?? '';
    const rest = (match[2] ?? '').trim();
    if (key === 'commissionNote') {
      index += 1;
      while (index < lines.length && !/^[A-Za-z0-9]+:/.test(lines[index] ?? '')) index += 1;
      continue;
    }
    if (rest === '') {
      const items: string[] = [];
      index += 1;
      while (index < lines.length && /^\s*-\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\s*-\s+/, '').trim());
        index += 1;
      }
      lists[key] = items;
      continue;
    }
    scalars[key] = rest.replace(/^['"]|['"]$/g, '');
    index += 1;
  }
  return { scalars, pros: lists.pros ?? [], cons: lists.cons ?? [] };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  return readProductFiles();
});

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getAuthor(slug: string): Promise<Author | undefined> {
  const authors = await getAuthors();
  return authors.find((author) => author.slug === slug);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
}

export function monthLabel(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value.slice(0, 7);
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
}

export function issueDate(now = new Date()): string {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
