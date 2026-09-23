import type { Metadata } from 'next';
import { SITE, buildDescription, buildTitle, canonical, ogImage, socialTitle } from './seo';

export function isPreviewDeployment(): boolean {
  return process.env.VERCEL_ENV === 'preview';
}

export function pageMetadata(input: {
  title?: string;
  ogTitle?: string;
  description?: string;
  path: string;
  ogSlug?: string;
  ogImageUrl?: string;
  ogImageAlt?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const title = buildTitle(input.title);
  const social = socialTitle(input.ogTitle, input.title);
  const description = buildDescription(input.description);
  const url = canonical(input.path);
  const image = input.ogImageUrl ?? ogImage(input.ogSlug);
  const imageAlt = input.ogImageAlt ?? (input.title ? `${input.title}, on ${SITE.name}` : `${SITE.name}: ${SITE.tagline}`);
  const hidden = Boolean(input.noindex) || isPreviewDeployment();

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: hidden
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: input.type === 'article' ? 'article' : 'website',
      title: social,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.defaultLocale,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE.twitter,
      title: social,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
  };
}
