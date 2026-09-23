import { SITE } from '~/lib/seo';

export function Newsletter({
  source = 'site',
  heading = 'The Monday letter.',
}: {
  source?: string;
  heading?: string;
}) {
  const live = Boolean(process.env.NEWSLETTER_PROVIDER && process.env.NEWSLETTER_PROVIDER !== 'stub');
  const emailId = `email-${source}`;

  return (
    <section id="newsletter" className="border-y border-[var(--color-ink)] py-10">
      <div className="mx-auto max-w-[var(--container-email)]">
        <p className="text-eyebrow">Newsletter</p>
        <h2 className="mt-3 font-serif text-[32px] font-medium leading-[1.1] tracking-[-0.02em]">
          {heading}
        </h2>
        <p className="mt-3 font-serif text-[17px] italic leading-relaxed text-[var(--color-ink-70)]">
          {live
            ? 'One short note when there is something worth sending.'
            : 'No live list yet. This opens a message to hello@morningstacks.com.'}
        </p>
        {live ? (
          <form action="/api/subscribe/" method="post" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="source" value={source} />
            <label className="block flex-1 font-sans text-[13px]" htmlFor={emailId}>
              Email
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@work.email"
                className="mt-2 w-full min-h-11 border border-[var(--color-ink-15)] bg-transparent px-3 py-2 font-serif text-[16px] outline-none focus:border-[var(--color-blue)]"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 border border-[var(--color-ink)] px-5 font-sans text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
            >
              Subscribe
            </button>
          </form>
        ) : (
          <form
            action={`mailto:${SITE.email}?subject=MorningStacks%20newsletter`}
            method="post"
            encType="text/plain"
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <label className="block flex-1 font-sans text-[13px]" htmlFor={emailId}>
              Email
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@work.email"
                className="mt-2 w-full min-h-11 border border-[var(--color-ink-15)] bg-transparent px-3 py-2 font-serif text-[16px] outline-none focus:border-[var(--color-blue)]"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 border border-[var(--color-ink)] px-5 font-sans text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
            >
              Write to us
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
