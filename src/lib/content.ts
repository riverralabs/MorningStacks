import 'server-only';
import { cache } from 'react';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { isArticleType, type ArticleType } from './content-model';
import { articleHref, articleVisibility, isBuildable, isPublished, type Visibility } from './publish';
import { authorByline } from './byline';

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
  summary: string;
  price: string;
  ourVerdict: string;
  pros: string[];
  cons: string[];
  rating: number;
  affiliateUrl: string;
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

export const getProducts = cache(async (): Promise<Product[]> => {
  const all = await reader.collections.products.all();
  return all.map((item) => {
    const entry = item.entry as unknown as Record<string, unknown>;
    return {
      slug: item.slug,
      name: str(entry.name),
      vendor: str(entry.vendor),
      summary: str(entry.summary),
      price: str(entry.price),
      ourVerdict: str(entry.ourVerdict),
      pros: Array.isArray(entry.pros) ? entry.pros.map(String) : [],
      cons: Array.isArray(entry.cons) ? entry.cons.map(String) : [],
      rating: typeof entry.rating === 'number' ? entry.rating : 0,
      affiliateUrl: str(entry.affiliateUrl),
      lastTested: strOrNull(entry.lastTested),
    };
  });
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

export function issueDate(now = new Date()): string {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
