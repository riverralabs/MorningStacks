import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  serverExternalPackages: ['@resvg/resvg-js', 'satori'],
  poweredByHeader: false,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG:
      process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ||
      process.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ||
      '',
    NEXT_PUBLIC_KEYSTATIC_STORAGE:
      process.env.VERCEL || process.env.KEYSTATIC_GITHUB_CLIENT_ID ? 'github' : 'local',
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
