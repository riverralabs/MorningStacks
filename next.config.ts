import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

/* Next streams page data through inline scripts, so script-src keeps 'unsafe-inline'.
 * Pagefind search compiles WebAssembly, which needs 'wasm-unsafe-eval'. */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/* Production only: dev needs eval for Fast Refresh, and Vercel previews inject the toolbar. */
const enforceCsp =
  process.env.NODE_ENV === 'production' && (!process.env.VERCEL || process.env.VERCEL_ENV === 'production');

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  serverExternalPackages: ['@resvg/resvg-js', 'satori'],
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: { inlineCss: true },
  env: {
    NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG:
      process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ||
      process.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ||
      '',
    NEXT_PUBLIC_KEYSTATIC_STORAGE:
      process.env.VERCEL || process.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'github' : 'local',
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      ...(enforceCsp
        ? [
            {
              source: '/((?!keystatic|api/keystatic).*)',
              headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }],
            },
          ]
        : []),
      {
        source: '/brand/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/affiliate-disclosure',
        destination: '/disclosure/',
        permanent: true,
      },
      {
        source: '/affiliate-disclosure/',
        destination: '/disclosure/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
