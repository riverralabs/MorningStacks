import { isActiveProgram, isPlaceholderAffiliateUrl, isProgramName, isProgramStatus } from './affiliate.ts';

export const ARTICLE_TYPES = ['review', 'roundup', 'briefing', 'explainer'] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

export const TYPE_LABELS: Record<ArticleType, string> = {
  review: 'Review',
  roundup: 'Roundup',
  briefing: 'Briefing',
  explainer: 'Explainer',
};

export const TYPE_ORDER: ArticleType[] = ['briefing', 'roundup', 'explainer', 'review'];

export function isArticleType(value: string): value is ArticleType {
  return (ARTICLE_TYPES as readonly string[]).includes(value);
}

export function typeLabel(type: ArticleType): string {
  return TYPE_LABELS[type];
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export type ProgramCatalogEntry = {
  slug: string;
  programStatus?: string;
  affiliateUrl?: string;
};

export type PublishGateInput = {
  type: string;
  status: string;
  seed?: boolean;
  template?: boolean;
  title?: string;
  description?: string;
  eyebrow?: string;
  category?: unknown;
  author?: unknown;
  date?: unknown;
  answer?: string | null;
  sources?: unknown[] | null;
  products?: unknown[] | null;
  lastTested?: Date | string | null;
  testMethod?: string | null;
  featured?: boolean;
  body?: string;
  catalog?: ProgramCatalogEntry[];
};

export type GateError = { path: string; message: string };

export function isLivePublished(data: Pick<PublishGateInput, 'status' | 'seed'>): boolean {
  return data.status === 'published' && !data.seed;
}

export function publishGateErrors(data: PublishGateInput): GateError[] {
  const errors: GateError[] = [];

  if (!isArticleType(data.type)) {
    errors.push({
      path: 'type',
      message: 'type must be review, roundup, briefing, or explainer',
    });
  }

  if (data.seed && data.status === 'published') {
    errors.push({ path: 'seed', message: 'seed forces off-live: uncheck seed before publishing' });
  }
  if (data.template && data.status === 'published') {
    errors.push({ path: 'template', message: 'template cannot be published' });
  }

  if (data.type === 'review' && (!data.products || data.products.length < 1)) {
    errors.push({ path: 'products', message: 'products are required for review' });
  }

  if (!isLivePublished(data)) return errors;

  if (!data.answer?.trim()) {
    errors.push({ path: 'answer', message: 'answer is required for publish' });
  } else {
    const words = wordCount(data.answer);
    if (words < 40 || words > 80) {
      errors.push({ path: 'answer', message: 'Opening answer must be 40 to 80 words' });
    }
  }

  if (!data.sources || data.sources.length < 1) {
    errors.push({ path: 'sources', message: 'at least one source is required for publish' });
  }

  if (data.type === 'review' && !data.lastTested && !data.testMethod?.trim()) {
    errors.push({
      path: 'lastTested',
      message: 'review needs lastTested or an explicit testMethod for publish',
    });
  }

  if (data.type === 'review' || data.type === 'roundup') {
    errors.push(...affiliatePromotionErrors(data));
  }

  return errors;
}

function componentProductSlugs(body: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}\\b[^>]*\\bproduct=["']([^"']+)["']`, 'gi');
  return [...body.matchAll(pattern)].flatMap((match) => (match[1] ? [match[1]] : []));
}

/**
 * A live review or roundup may list a product before its program is active.
 * The automatic card then links to the public site and is not marked sponsored.
 * A ProductCard or AffiliateLink in the body is a promotion, so that program
 * must be active. A program marked active while the URL is still
 * `?via=morningstacks` fails.
 */
export function affiliatePromotionErrors(data: PublishGateInput): GateError[] {
  if (!data.catalog) return [];
  const errors: GateError[] = [];
  const bySlug = new Map(data.catalog.map((entry) => [entry.slug, entry]));
  const body = data.body ?? '';
  const named = new Set<string>();
  for (const item of data.products ?? []) {
    if (typeof item === 'string' && item.trim()) named.add(item.trim());
  }
  for (const slug of componentProductSlugs(body, 'ProductCard')) named.add(slug);
  for (const slug of componentProductSlugs(body, 'AffiliateLink')) named.add(slug);

  const promotedInBody = [
    ...componentProductSlugs(body, 'AffiliateLink'),
    ...componentProductSlugs(body, 'ProductCard'),
  ];
  for (const slug of promotedInBody) {
    const product = bySlug.get(slug);
    if (!product || !isActiveProgram(product)) {
      errors.push({
        path: 'products',
        message: `${slug} is promoted but is not an active program`,
      });
    }
  }

  for (const slug of named) {
    const product = bySlug.get(slug);
    if (!product) continue;
    if (product.programStatus === 'active' && isPlaceholderAffiliateUrl(product.affiliateUrl ?? '')) {
      errors.push({
        path: 'affiliateUrl',
        message: `${slug} is marked active but the affiliate URL is still the via=morningstacks placeholder`,
      });
    }
  }

  return errors;
}

export function productProgramErrors(product: {
  status?: string;
  program?: string;
  affiliateUrl?: string;
}): GateError[] {
  const errors: GateError[] = [];
  const status = product.status || 'none';
  if (!isProgramStatus(status)) {
    errors.push({ path: 'status', message: 'program status must be none, applied, or active' });
  }
  if (product.program && !isProgramName(product.program)) {
    errors.push({
      path: 'program',
      message: 'program must be direct, rewardful, partnerstack, impact, or other',
    });
  }
  if (status === 'active' && (!product.affiliateUrl || isPlaceholderAffiliateUrl(product.affiliateUrl))) {
    errors.push({
      path: 'affiliateUrl',
      message: 'active program cannot use the via=morningstacks placeholder',
    });
  }
  return errors;
}

export function shouldShowDisclosure(input: { products?: unknown[]; body?: string }): boolean {
  if (input.products && input.products.length > 0) return true;
  const body = input.body ?? '';
  return (
    /rel=["']sponsored\b/i.test(body) ||
    /via=morningstacks/i.test(body) ||
    /<ProductCard\b/i.test(body) ||
    /<AffiliateLink\b/i.test(body)
  );
}

export function featuredPublishedCount(
  entries: Array<Pick<PublishGateInput, 'featured' | 'status' | 'seed'>>,
): number {
  return entries.filter((entry) => entry.featured && isLivePublished(entry)).length;
}
