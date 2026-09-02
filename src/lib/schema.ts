import type {
  Article,
  Review,
  FAQPage,
  Organization,
  WithContext,
  BreadcrumbList,
  WebSite,
} from 'schema-dts';
import { SITE } from './seo';

export function organizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    logo: new URL('/brand/morningstacks_badge.svg', SITE.url).toString(),
    sameAs: [],
    description: SITE.description,
    parentOrganization: {
      '@type': 'Organization',
      name: SITE.publisher,
    },
  };
}

export function websiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/search?q={search_term_string}`,
      // schema-dts requires query-input as a string-like enum entry; cast below
      'query-input': 'required name=search_term_string',
    } as unknown as WebSite['potentialAction'],
  };
}

export function articleSchema(input: {
  url: string;
  title: string;
  description: string;
  datePublished: Date;
  dateModified?: Date;
  image: string;
  section?: string;
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    publisher: {
      '@type': 'Organization',
      name: SITE.publisher,
      logo: {
        '@type': 'ImageObject',
        url: new URL('/brand/morningstacks_badge.svg', SITE.url).toString(),
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    articleSection: input.section,
  };
}

export function reviewSchema(input: {
  url: string;
  title: string;
  description: string;
  datePublished: Date;
  dateModified?: Date;
  image: string;
  productName: string;
  productCategory?: string;
  rating: number;
  ratingMax?: number;
}): WithContext<Review> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    publisher: {
      '@type': 'Organization',
      name: SITE.publisher,
    },
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: input.productName,
      applicationCategory: input.productCategory ?? 'BusinessApplication',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: input.rating,
      bestRating: input.ratingMax ?? 5,
      worstRating: 0,
    },
    url: input.url,
  };
}

export function faqSchema(faq: { q: string; a: string }[]): WithContext<FAQPage> | null {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: { '@type': 'Answer', text: entry.a },
    })),
  };
}

export function breadcrumbSchema(
  trail: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
