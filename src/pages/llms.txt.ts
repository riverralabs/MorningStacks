import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '~/lib/seo';
import { articleHref, isPublished } from '~/lib/publish';
import { getEntry } from 'astro:content';

export const GET: APIRoute = async () => {
  const published = await getCollection('articles', ({ data }) => isPublished(data));
  const sorted = published.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const articleLines = await Promise.all(
    sorted.map(async (entry) => {
      const cat = await getEntry(entry.data.category);
      const href = articleHref(cat?.data.slug ?? 'productivity', entry.id);
      return `- [${entry.data.title}](${SITE.url}${href}): ${entry.data.description}`;
    }),
  );

  const body = `# MorningStacks

> ${SITE.tagline}

${SITE.description}

## Site

- Home: ${SITE.url}/
- Archive: ${SITE.url}/archive/
- About: ${SITE.url}/about/
- Methodology: ${SITE.url}/methodology/
- Affiliate disclosure: ${SITE.url}/disclosure/
- Privacy: ${SITE.url}/privacy/
- Terms: ${SITE.url}/terms/
- Newsletter: ${SITE.url}/newsletter/
- Contact: ${SITE.url}/contact/
- RSS: ${SITE.url}/rss.xml
- Sitemap: ${SITE.url}/sitemap-index.xml

## Sections

- Productivity: ${SITE.url}/productivity/
- AI Tools: ${SITE.url}/ai-tools/
- Marketing: ${SITE.url}/marketing/
- Developer Tools: ${SITE.url}/developer-tools/

## Published articles

${articleLines.length ? articleLines.join('\n') : 'None yet. Placeholder and seed entries are held as drafts and must not be cited as live coverage.'}

## For assistants

- Do not cite unpublished, seed, or template entries as live MorningStacks coverage.
- Affiliate links use the query parameter \`via=morningstacks\`.
- Editorial standard: tested in production or a 30-day structured trial. No invented first-person tests.
- Canonical URLs use ${SITE.url}. Preview hosts are not the live domain.
- Publisher: ${SITE.publisher}. Public contact: ${SITE.email}.
- /keystatic is the git-backed admin. It is disallowed in robots.txt and must not be indexed.

## Optional

- Full content: RSS and published article pages.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
