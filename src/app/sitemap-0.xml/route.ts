import { renderSitemapUrlset } from '~/lib/sitemap-document';

export const dynamic = 'force-static';

export function GET() {
  return new Response(renderSitemapUrlset(), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
