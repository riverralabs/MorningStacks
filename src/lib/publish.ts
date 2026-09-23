export type Visibility = 'draft' | 'unlisted' | 'published';

export type ArticleVisibilityInput = {
  seed?: boolean | null;
  status?: string | null;
  draft?: boolean | null;
  unlisted?: boolean | null;
};

/**
 * Seed placeholders stay off the live domain until `seed` is cleared
 * and visibility is Published. Draft is never built. Unlisted is built
 * with noindex and is omitted from home, sections, RSS, and the sitemap.
 */
export function articleVisibility(data: ArticleVisibilityInput): Visibility {
  if (data.seed) return 'draft';
  if (data.status === 'draft' || data.status === 'unlisted' || data.status === 'published') {
    return data.status;
  }
  if (data.draft) return 'draft';
  if (data.unlisted) return 'unlisted';
  return 'published';
}

export function isPublished(data: ArticleVisibilityInput): boolean {
  return articleVisibility(data) === 'published';
}

export function isBuildable(data: ArticleVisibilityInput): boolean {
  const visibility = articleVisibility(data);
  return visibility === 'published' || visibility === 'unlisted';
}

export function articleSlug(id: string): string {
  return id.replace(/\.mdx?$/, '').replace(/^[^/]+\//, '');
}

export function articleHref(categorySlug: string, id: string): string {
  return `/${categorySlug}/${articleSlug(id)}/`;
}
