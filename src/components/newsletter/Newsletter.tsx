import { isNewsletterLive } from '~/lib/newsletter';
import { SubscribeForm } from './SubscribeForm';

const PITCH =
  'One short email on Monday morning. New briefings and comparisons, labeled the same way they are on the site.';

/** Full-width band used at the foot of the front page, sections, and articles. Hidden until a list provider is connected. */
export function NewsletterBand({ source }: { source: string }) {
  if (!isNewsletterLive()) return null;
  const headingId = `newsletter-${source}`;
  return (
    <section
      aria-labelledby={headingId}
      className="bg-[var(--color-navy)] text-[var(--color-white)]"
    >
      <div className="container-page section-y grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <h2
            id={headingId}
            className="text-[length:var(--text-head-lg)] leading-[var(--text-head-lg--line-height)] font-extrabold tracking-[var(--text-head-lg--letter-spacing)] text-[var(--color-white)]"
          >
            The Monday letter
          </h2>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-[var(--color-navy-mute)]">
            {PITCH}
          </p>
        </div>
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
          <SubscribeForm source={source} tone="navy" />
        </div>
      </div>
    </section>
  );
}

export function NewsletterPanel({ source }: { source: string }) {
  if (!isNewsletterLive()) return null;
  return (
    <div className="border border-[var(--color-ink)] bg-[var(--color-white)] p-6 md:p-8">
      <h2 className="text-[length:var(--text-head-md)] font-extrabold tracking-[var(--text-head-md--letter-spacing)]">
        Subscribe
      </h2>
      <p className="mt-2 mb-5 text-[15px] leading-relaxed text-[var(--color-ink-2)]">{PITCH}</p>
      <SubscribeForm source={source} />
    </div>
  );
}
