import { NextResponse } from 'next/server';
import { cleanSource, isValidEmail, looksAutomated, subscribe } from '~/lib/newsletter';
import { SITE } from '~/lib/seo';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

/** Per-instance limit. It slows a single client down; it is not a global quota. */
function rateLimited(key: string, now: number): boolean {
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

function sameSite(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const from = new URL(origin).host;
    const allowed = [
      new URL(request.url).host,
      new URL(SITE.url).host,
      request.headers.get('host'),
      request.headers.get('x-forwarded-host'),
    ];
    return allowed.includes(from);
  } catch {
    return false;
  }
}

type Fields = { email: string; source: string; website: string; t: string };

async function readFields(request: Request): Promise<Fields | null> {
  const contentType = request.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const body = (await request.json()) as Record<string, unknown>;
      return {
        email: String(body.email ?? ''),
        source: String(body.source ?? ''),
        website: String(body.website ?? ''),
        t: String(body.t ?? ''),
      };
    }
    const form = await request.formData();
    return {
      email: String(form.get('email') ?? ''),
      source: String(form.get('source') ?? ''),
      website: String(form.get('website') ?? ''),
      t: String(form.get('t') ?? ''),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const respond = (status: 'success' | 'invalid' | 'error', reason?: string) => {
    if (wantsJson) {
      return NextResponse.json(
        { ok: status === 'success', ...(reason ? { reason } : {}) },
        { status: status === 'success' ? 200 : 400, headers: { 'cache-control': 'no-store' } },
      );
    }
    const url = new URL('/newsletter/', request.url);
    url.searchParams.set('status', status);
    if (reason) url.searchParams.set('reason', reason);
    const response = NextResponse.redirect(url, 303);
    response.headers.set('cache-control', 'no-store');
    return response;
  };

  if (!sameSite(request)) return respond('error', 'origin');

  const now = Date.now();
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip, now)) return respond('error', 'too-many-attempts');

  const fields = await readFields(request);
  if (!fields) return respond('invalid');

  // Bots get the same answer as people, so they learn nothing from the response.
  if (looksAutomated({ honeypot: fields.website, startedAt: fields.t, now })) return respond('success');

  const email = fields.email.trim();
  if (!isValidEmail(email)) return respond('invalid');

  const result = await subscribe(
    { email, source: cleanSource(fields.source) },
    {
      NEWSLETTER_PROVIDER: process.env.NEWSLETTER_PROVIDER,
      BEEHIIV_API_KEY: process.env.BEEHIIV_API_KEY,
      BEEHIIV_PUBLICATION_ID: process.env.BEEHIIV_PUBLICATION_ID,
      CONVERTKIT_API_KEY: process.env.CONVERTKIT_API_KEY,
      CONVERTKIT_FORM_ID: process.env.CONVERTKIT_FORM_ID,
      BUTTONDOWN_API_KEY: process.env.BUTTONDOWN_API_KEY,
    },
  );

  if (!result.ok) return respond('error', result.reason);
  return respond('success');
}
