/** Fallback query used only when a stored URL has no affiliate parameters yet. */
export const AFFILIATE_VIA = 'morningstacks';

export const PROGRAMS = ['direct', 'rewardful', 'partnerstack', 'impact', 'other'] as const;
export type ProgramName = (typeof PROGRAMS)[number];

export const PROGRAM_STATUSES = ['none', 'applied', 'active'] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

/** Query keys that mean the URL is already a program link. Do not rewrite those. */
const AFFILIATE_PARAMS = [
  'via',
  'ref',
  'aff',
  'affiliate',
  'irclickid',
  'partner',
  'fp_ref',
  'ps_partner_key',
  'ps_xid',
  'afmc',
  'hop',
];

/**
 * Hosts that are tracking redirects rather than the vendor site. A pasted
 * network URL on one of these is used as-is, even with an empty query string.
 */
const NETWORK_HOSTS = [
  'impact.com',
  'ojrq.net',
  'pxf.io',
  'sjv.io',
  'partnerstack.com',
  'shareasale.com',
  'awin1.com',
  'anrdoezrs.net',
  'dpbolvw.net',
  'tkqlhce.com',
  'jdoqocy.com',
  'kqzyfj.com',
];

export function isProgramName(value: string): value is ProgramName {
  return (PROGRAMS as readonly string[]).includes(value);
}

export function isProgramStatus(value: string): value is ProgramStatus {
  return (PROGRAM_STATUSES as readonly string[]).includes(value);
}

function parsedUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function hostIsNetwork(hostname: string): boolean {
  return NETWORK_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export function hasAffiliateParameters(raw: string): boolean {
  const url = parsedUrl(raw);
  if (!url) return false;
  if (hostIsNetwork(url.hostname.replace(/^www\./, ''))) return true;
  return AFFILIATE_PARAMS.some((key) => url.searchParams.has(key));
}

/** True when the only affiliate mark is the site's own placeholder query. */
export function isPlaceholderAffiliateUrl(raw: string): boolean {
  const url = parsedUrl(raw);
  if (!url) return false;
  if (url.searchParams.get('via') !== AFFILIATE_VIA) return false;
  const other = AFFILIATE_PARAMS.filter((key) => key !== 'via' && url.searchParams.has(key));
  return other.length === 0;
}

/**
 * Add `via=morningstacks` only when the URL has no affiliate parameters.
 * A Rewardful, PartnerStack, or Impact URL is returned unchanged.
 */
export function withAffiliateVia(raw: string): string {
  const url = parsedUrl(raw);
  if (!url) return raw;
  if (hasAffiliateParameters(raw)) return url.toString();
  url.searchParams.set('via', AFFILIATE_VIA);
  return url.toString();
}

export function isActiveProgram(product: {
  programStatus?: string;
  affiliateUrl?: string;
}): boolean {
  return (
    product.programStatus === 'active' &&
    Boolean(product.affiliateUrl) &&
    !isPlaceholderAffiliateUrl(product.affiliateUrl ?? '')
  );
}

export function goHref(slug: string): string {
  return `/go/${slug}/`;
}
