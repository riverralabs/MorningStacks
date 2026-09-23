import { NextResponse } from 'next/server';
import { isActiveProgram, withAffiliateVia } from '~/lib/affiliate';
import { getProducts } from '~/lib/content';

export const dynamic = 'force-dynamic';

/** Stable outbound link. Program URLs live in Keystatic, not in articles. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  const headers = { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' };
  if (!product || !isActiveProgram(product)) {
    return new NextResponse('Not found', { status: 404, headers });
  }
  const response = NextResponse.redirect(withAffiliateVia(product.affiliateUrl), 302);
  response.headers.set('X-Robots-Tag', 'noindex');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
