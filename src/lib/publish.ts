import type { CollectionEntry } from 'astro:content';
import { getEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;
export type Visibility = 'draft' | 'unlisted' | 'published';

/**
 * Seed placeholders stay off the live domain until `seed` is cleared
 * and visibility is Published. Draft is never built. Unlisted is built
 * with noindex and is omitted from home, sections, RSS, and the sitemap.
 */
export function articleVisibility(data: ArticleEntry['data']): Visibility {
  if (data.seed) return 'draft';
  if (data.status) return data.status;
  if (data.draft) return 'draft';
  if (data.unlisted) return 'unlisted';
  return 'published';
}

export function isPublished(data: ArticleEntry['data']): boolean {
  return articleVisibility(data) === 'published';
}

export function isBuildable(data: ArticleEntry['data']): boolean {
  const visibility = articleVisibility(data);
  return visibility === 'published' || visibility === 'unlisted';
}

export function articleSlug(id: string): string {
  return id.replace(/\.mdx?$/, '').replace(/^[^/]+\//, '');
}

export function articleHref(categorySlug: string, id: string): string {
  return `/${categorySlug}/${articleSlug(id)}/`;
}

export async function articleHrefFor(entry: ArticleEntry): Promise<string> {
  const category = await getEntry(entry.data.category);
  return articleHref(category?.data.slug ?? 'productivity', entry.id);
}
