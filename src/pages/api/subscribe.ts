import type { APIRoute } from 'astro';
import { subscribe } from '~/lib/newsletter';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  let email: string | null = null;
  let source: string | undefined;

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = (await request.json()) as { email?: string; source?: string };
    email = body.email ?? null;
    source = body.source;
  } else {
    const form = await request.formData();
    email = String(form.get('email') ?? '').trim() || null;
    const src = form.get('source');
    source = typeof src === 'string' ? src : undefined;
  }

  if (!email) {
    return redirect('/newsletter/?status=invalid', 303);
  }

  const env = {
    NEWSLETTER_PROVIDER: process.env.NEWSLETTER_PROVIDER,
    BEEHIIV_API_KEY: process.env.BEEHIIV_API_KEY,
    BEEHIIV_PUBLICATION_ID: process.env.BEEHIIV_PUBLICATION_ID,
    CONVERTKIT_API_KEY: process.env.CONVERTKIT_API_KEY,
    CONVERTKIT_FORM_ID: process.env.CONVERTKIT_FORM_ID,
    BUTTONDOWN_API_KEY: process.env.BUTTONDOWN_API_KEY,
  };

  const result = await subscribe({ email, source }, env);

  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('application/json')) {
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!result.ok) {
    return redirect(`/newsletter/?status=error&reason=${encodeURIComponent(result.reason)}`, 303);
  }
  return redirect('/newsletter/?status=success', 303);
};
