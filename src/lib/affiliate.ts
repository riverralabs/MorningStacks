/** Canonical affiliate query used on every outbound vendor URL. */
export const AFFILIATE_VIA = 'morningstacks';

export function withAffiliateVia(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.searchParams.get('via') === AFFILIATE_VIA) return url.toString();
    url.searchParams.delete('ref');
    url.searchParams.set('via', AFFILIATE_VIA);
    return url.toString();
  } catch {
    return raw;
  }
}
