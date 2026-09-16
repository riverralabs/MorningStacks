/** Preferred public origin. Sitemap, canonicals, og:url, and JSON-LD page URLs use this host. */
export const CANONICAL_SITE_URL = 'https://www.morningstacks.com';

const CANONICAL_HOST = 'www.morningstacks.com';
const APEX_HOST = 'morningstacks.com';

/**
 * Single resolver for the public site origin.
 * `SITE_URL` may override the default (preview/local), but the production
 * apex host is always rewritten to https://www.morningstacks.com so GSC
 * never sees a split canonical.
 */
export function resolveSiteUrl(raw?: string | undefined): string {
  const candidate = (raw ?? '').trim() || CANONICAL_SITE_URL;
  try {
    const url = new URL(candidate);
    if (url.hostname === APEX_HOST || url.hostname === CANONICAL_HOST) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
    }
    return url.origin;
  } catch {
    return CANONICAL_SITE_URL;
  }
}
