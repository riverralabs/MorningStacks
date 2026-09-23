import { isNewsletterLive } from '~/lib/newsletter';
import { SITE } from '~/lib/seo';
import { SubscribeForm } from './SubscribeForm';

const PITCH =
  'One short email on Monday morning. New briefings and comparisons, labeled the same way they are on the site.';

function NotOpen({ tone }: { tone: 'light' | 'navy' }) {
  const navy = tone === 'navy';
  return (
    <div>
      <p className={`text-[15px] leading-relaxed ${navy ? 'text-[var(--color-navy-mute)]' : 'text-[var(--color-ink-2)]'}`}>
        The sign-up form is not connected yet. Send us a note and we will add your address to the list by hand.
      </p>
      <a
        href={`mailto:${SITE.email}?subject=${encodeURIComponent('Add me to the Monday letter')}`}
        className={`btn mt-4 ${navy ? 'btn-inverse' : 'btn-primary'}`}
      >
        Email {SITE.email}
      </a>
    </div>
  );
}

/** Full-width band used at the foot of the front page, sections, and articles. */
export function NewsletterBand({ source }: { source: string }) {
  const live = isNewsletterLive();
  const headingId = `newsletter-${source}`;
  return (
    <section aria-labelledby={headingId} className="bg-[var(--color-navy)] text-[var(--color-white)]">
      <div className="container-page section-y grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <h2
            id={headingId}
            className="text-[length:var(--text-head-lg)] leading-[var(--text-head-lg--line-height)] font-extrabold tracking-[var(--text-head-lg--letter-spacing)] text-[var(--color-white)]"
          >
            The Monday letter
          </h2>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-[var(--color-navy-mute)]">{PITCH}</p>
        </div>
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
          {live ? <SubscribeForm source={source} tone="navy" /> : <NotOpen tone="navy" />}
        </div>
      </div>
    </section>
  );
}

export function NewsletterPanel({ source }: { source: string }) {
  const live = isNewsletterLive();
  return (
    <div className="border border-[var(--color-ink)] bg-[var(--color-white)] p-6 md:p-8">
      <h2 className="text-[length:var(--text-head-md)] font-extrabold tracking-[var(--text-head-md--letter-spacing)]">
        Subscribe
      </h2>
      <p className="mt-2 mb-5 text-[15px] leading-relaxed text-[var(--color-ink-2)]">{PITCH}</p>
      {live ? <SubscribeForm source={source} /> : <NotOpen tone="light" />}
    </div>
  );
}
