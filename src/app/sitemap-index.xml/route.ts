import { renderSitemapIndex } from '~/lib/sitemap-document';

export const dynamic = 'force-static';

export function GET() {
  return new Response(renderSitemapIndex(), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
