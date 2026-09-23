import { getPublishedArticles } from '~/lib/content';
import { SITE } from '~/lib/seo';

export const dynamic = 'force-static';

export async function GET() {
  const articles = await getPublishedArticles();
  const articleLines = articles.map(
    (article) => `- [${article.title}](${SITE.url}${article.href}): ${article.description}`,
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
- Sitemap alias: ${SITE.url}/sitemap.xml

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
- Most live pieces are sourced briefings and comparisons, labeled as such. A review requires type review plus lastTested or an explicit test method. No invented first-person tests.
- Canonical URLs use ${SITE.url}. Preview hosts are not the live domain.
- Publisher: ${SITE.publisher}. Public contact: ${SITE.email}.
- /keystatic is the git-backed admin. It is disallowed in robots.txt and must not be indexed.
- robots.txt allows GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, Google-Extended, CCBot, PerplexityBot, Perplexity-User, and Applebot-Extended so assistants can retrieve and cite published pages.

## Optional

- Full content: RSS and published article pages.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
