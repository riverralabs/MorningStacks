/* Provider-agnostic newsletter subscribe.
 *
 * The site posts to /api/subscribe with an email + optional source. That
 * endpoint calls subscribe() below. Swap providers by changing
 * NEWSLETTER_PROVIDER and adding the matching env vars — UI and form
 * contract don't change.
 */

export type SubscribeInput = {
  email: string;
  source?: string;
};

export type SubscribeResult =
  | { ok: true; provider: string }
  | { ok: false; provider: string; reason: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

type Provider = (_input: SubscribeInput, _env: Env) => Promise<SubscribeResult>;

type Env = {
  NEWSLETTER_PROVIDER?: string;
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
  CONVERTKIT_API_KEY?: string;
  CONVERTKIT_FORM_ID?: string;
  BUTTONDOWN_API_KEY?: string;
};

const stub: Provider = async ({ email, source }) => {
  console.info('[newsletter:stub] subscribe', { email, source });
  return { ok: true, provider: 'stub' };
};

const beehiiv: Provider = async ({ email }, env) => {
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    return { ok: false, provider: 'beehiiv', reason: 'missing-credentials' };
  }
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, reactivate_existing: true, send_welcome_email: true }),
    },
  );
  if (!res.ok) return { ok: false, provider: 'beehiiv', reason: `http-${res.status}` };
  return { ok: true, provider: 'beehiiv' };
};

const convertkit: Provider = async ({ email }, env) => {
  if (!env.CONVERTKIT_API_KEY || !env.CONVERTKIT_FORM_ID) {
    return { ok: false, provider: 'convertkit', reason: 'missing-credentials' };
  }
  const res = await fetch(
    `https://api.convertkit.com/v3/forms/${env.CONVERTKIT_FORM_ID}/subscribe`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: env.CONVERTKIT_API_KEY, email }),
    },
  );
  if (!res.ok) return { ok: false, provider: 'convertkit', reason: `http-${res.status}` };
  return { ok: true, provider: 'convertkit' };
};

const buttondown: Provider = async ({ email }, env) => {
  if (!env.BUTTONDOWN_API_KEY) {
    return { ok: false, provider: 'buttondown', reason: 'missing-credentials' };
  }
  const res = await fetch('https://api.buttondown.email/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok) return { ok: false, provider: 'buttondown', reason: `http-${res.status}` };
  return { ok: true, provider: 'buttondown' };
};

const providers: Record<string, Provider> = {
  stub,
  beehiiv,
  convertkit,
  buttondown,
};

export async function subscribe(input: SubscribeInput, env: Env): Promise<SubscribeResult> {
  if (!isValidEmail(input.email)) {
    return { ok: false, provider: 'pre-validation', reason: 'invalid-email' };
  }
  const name = env.NEWSLETTER_PROVIDER ?? 'stub';
  const provider = providers[name] ?? stub;
  return provider(input, env);
}
