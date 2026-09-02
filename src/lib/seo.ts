export const SITE = {
  name: 'MorningStacks',
  tagline: 'The software stack for operators and founders.',
  description:
    'Editorial-first reviews of SaaS, AI tools, and software that operators and founders actually pay for. Independent, tested, no fluff.',
  url: import.meta.env.SITE_URL ?? 'https://morningstacks.com',
  twitter: '@morningstacks',
  defaultOgImage: '/og/default.png',
  defaultLocale: 'en_US',
  email: 'hello@morningstacks.com',
} as const;

export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE.name} · ${SITE.tagline}`;
  const composed = `${pageTitle} · ${SITE.name}`;
  return composed.length <= 60 ? composed : pageTitle;
}

export function buildDescription(pageDescription?: string): string {
  const desc = pageDescription ?? SITE.description;
  if (desc.length >= 150 && desc.length <= 160) return desc;
  if (desc.length > 160) return desc.slice(0, 157).trimEnd() + '…';
  return desc;
}

export function canonical(pathname: string, base: string = SITE.url): string {
  const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  return new URL(path, base).toString();
}

export function ogImage(slug?: string, base: string = SITE.url): string {
  const path = slug ? `/og/${slug}.png` : SITE.defaultOgImage;
  return new URL(path, base).toString();
}
