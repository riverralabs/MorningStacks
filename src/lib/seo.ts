import { canonicalUrl, resolveSiteUrl } from './site-url';

export const SITE = {
  name: 'MorningStacks',
  tagline: 'Straight answers on the software you pay for.',
  description:
    'Sourced briefings, comparisons, and reviews of the SaaS, AI, and developer tools operators and founders pay for. Prices checked. Affiliate links labeled.',
  url: resolveSiteUrl(process.env.SITE_URL),
  twitter: '@morningstacks',
  defaultOgImage: '/og/default.png',
  defaultLocale: 'en_US',
  email: 'hello@morningstacks.com',
  publisher: 'Riverra Labs LLP',
} as const;

export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE.name} · ${SITE.tagline}`;
  const composed = `${pageTitle} · ${SITE.name}`;
  return composed.length <= 60 ? composed : pageTitle;
}

/** og:title / twitter:title. Frontmatter ogTitle wins over the page H1. */
export function socialTitle(ogTitle?: string, pageTitle?: string): string {
  const trimmed = ogTitle?.trim();
  if (trimmed) return trimmed;
  return buildTitle(pageTitle);
}

export function buildDescription(pageDescription?: string): string {
  const desc = pageDescription ?? SITE.description;
  if (desc.length >= 150 && desc.length <= 160) return desc;
  if (desc.length > 160) return desc.slice(0, 157).trimEnd() + '…';
  return desc;
}

export function canonical(pathname: string, base: string = SITE.url): string {
  return canonicalUrl(pathname, base);
}

export function ogImage(slug?: string, base: string = SITE.url): string {
  const path = slug ? `/og/${slug}.png` : SITE.defaultOgImage;
  return new URL(path, base).toString();
}
