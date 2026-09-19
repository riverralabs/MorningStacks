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

  return errors;
}

export function shouldShowDisclosure(input: { products?: unknown[]; body?: string }): boolean {
  if (input.products && input.products.length > 0) return true;
  const body = input.body ?? '';
  return (
    /rel=["']sponsored\b/i.test(body) ||
    /via=morningstacks/i.test(body) ||
    /<ProductCard\b/i.test(body)
  );
}

export function featuredPublishedCount(
  entries: Array<Pick<PublishGateInput, 'featured' | 'status' | 'seed'>>,
): number {
  return entries.filter((entry) => entry.featured && isLivePublished(entry)).length;
}
