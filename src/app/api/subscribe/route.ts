import { NextResponse } from 'next/server';
import { subscribe } from '~/lib/newsletter';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let email: string | null = null;
  let source: string | undefined;
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as { email?: string; source?: string };
    email = body.email ?? null;
    source = body.source;
  } else {
    try {
      const form = await request.formData();
      email = String(form.get('email') ?? '').trim() || null;
      const src = form.get('source');
      source = typeof src === 'string' ? src : undefined;
    } catch {
      email = null;
    }
  }

  const redirectTo = (status: string, reason?: string) => {
    const url = new URL('/newsletter/', request.url);
    url.searchParams.set('status', status);
    if (reason) url.searchParams.set('reason', reason);
    return NextResponse.redirect(url, 303);
  };

  if (!email) return redirectTo('invalid');

  const result = await subscribe(
    { email, source },
    {
      NEWSLETTER_PROVIDER: process.env.NEWSLETTER_PROVIDER,
      BEEHIIV_API_KEY: process.env.BEEHIIV_API_KEY,
      BEEHIIV_PUBLICATION_ID: process.env.BEEHIIV_PUBLICATION_ID,
      CONVERTKIT_API_KEY: process.env.CONVERTKIT_API_KEY,
      CONVERTKIT_FORM_ID: process.env.CONVERTKIT_FORM_ID,
      BUTTONDOWN_API_KEY: process.env.BUTTONDOWN_API_KEY,
    },
  );

  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('application/json')) {
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (!result.ok) return redirectTo('error', result.reason);
  return redirectTo('success');
}
