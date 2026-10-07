import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

/* Next streams page data through inline scripts, so script-src keeps 'unsafe-inline'.
 * Pagefind search compiles WebAssembly, which needs 'wasm-unsafe-eval'.
 * Google hosts are for AdSense and the EEA, UK, and Swiss consent message.
 * frame-src is set because ad slots and that message load in iframes.
 * img-src already allows any https image. */
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
    'https://pagead2.googlesyndication.com',
    'https://tpc.googlesyndication.com',
    'https://www.googletagservices.com',
    'https://adservice.google.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://fundingchoicesmessages.google.com',
    'https://securepubads.g.doubleclick.net',
  ].join(' '),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  [
    "connect-src 'self'",
    'https://pagead2.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://adservice.google.com',
    'https://ep1.adtrafficquality.google',
    'https://ep2.adtrafficquality.google',
    'https://fundingchoicesmessages.google.com',
    'https://csi.gstatic.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://securepubads.g.doubleclick.net',
  ].join(' '),
  [
    'frame-src',
    'https://googleads.g.doubleclick.net',
    'https://tpc.googlesyndication.com',
    'https://pagead2.googlesyndication.com',
    'https://www.google.com',
    'https://fundingchoicesmessages.google.com',
    'https://www.googletagservices.com',
    'https://securepubads.g.doubleclick.net',
  ].join(' '),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/* Production only: dev needs eval for Fast Refresh, and Vercel previews inject the toolbar. */
const enforceCsp =
  process.env.NODE_ENV === 'production' &&
  (!process.env.VERCEL || process.env.VERCEL_ENV === 'production');

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  serverExternalPackages: ['@resvg/resvg-js', 'satori'],
  poweredByHeader: false,
  images: { unoptimized: true },
  experimental: { inlineCss: true },
  /* Server routes read content at request time (Keystatic reader, product files for /go/,
   * article lookups for /og/). The tracer cannot follow those paths, so ship them explicitly. */
  outputFileTracingIncludes: {
    '/**': ['./src/content/**/*'],
    '/og/**': ['./src/assets/og/**/*', './src/assets/fonts/**/*', './public/brand/**/*'],
    '/media/**': ['./src/assets/articles/**/*'],
  },
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
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
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
