import { getPublishedArticles } from '~/lib/content';
import { SITE } from '~/lib/seo';

export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function GET() {
  const articles = await getPublishedArticles();
  const items = articles
    .map((article) => {
      const pub = new Date(`${article.date.slice(0, 10)}T00:00:00Z`).toUTCString();
      return `<item><title>${escapeXml(article.title)}</title><link>${escapeXml(`${SITE.url}${article.href}`)}</link><description>${escapeXml(article.description)}</description><pubDate>${escapeXml(pub)}</pubDate><guid>${escapeXml(`${SITE.url}${article.href}`)}</guid></item>`;
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(SITE.name)}</title><description>${escapeXml(SITE.description)}</description><link>${escapeXml(SITE.url)}/</link><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
