import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** HTML paths keep a trailing slash. API, admin, and file URLs do not. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/keystatic') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/og/') ||
    pathname.startsWith('/media/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  if (pathname !== '/' && !pathname.endsWith('/')) {
    const url = new URL(request.url);
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
