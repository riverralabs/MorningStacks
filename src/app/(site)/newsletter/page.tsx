import type { Metadata } from 'next';
import { NewsletterPanel } from '~/components/newsletter/Newsletter';
import { PageHead } from '~/components/stories/Story';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'The Monday letter',
  description:
    'One short email on Monday morning with new MorningStacks briefings and comparisons, labeled the same way they are on the site.',
  path: '/newsletter/',
  ogSlug: 'newsletter',
});

const MESSAGES: Record<string, { tone: 'good' | 'bad'; text: string }> = {
  success: { tone: 'good', text: 'Thanks. You are on the list for the next Monday letter.' },
  invalid: { tone: 'bad', text: 'That email address did not look right. Check it and try again.' },
  error: { tone: 'bad', text: 'We could not add that address just now. Try again in a few minutes.' },
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const message = status ? MESSAGES[status] : undefined;

  return (
    <>
      <PageHead
        crumbs={[
          { href: '/', label: 'Front page' },
          { href: '/newsletter/', label: 'Newsletter' },
        ]}
        title="The Monday letter"
        description="One short email on Monday morning. New briefings and comparisons, labeled the same way they are on the site."
      />
      <section className="container-page section-y grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          {message ? (
            <p
              role="status"
              className={`mb-6 px-5 py-4 text-[15px] font-semibold ${
                message.tone === 'good'
                  ? 'bg-[var(--color-good-tint)] text-[var(--color-good)]'
                  : 'bg-[var(--color-bad-tint)] text-[var(--color-bad)]'
              }`}
            >
              {message.text}
            </p>
          ) : null}
          <NewsletterPanel source="newsletter-page" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <p className="border-t-[3px] border-[var(--color-ink)] pt-3 text-[13px] font-extrabold tracking-[0.08em] uppercase">
            What to expect
          </p>
          <dl className="mt-2 divide-y divide-[var(--color-rule)]">
            {[
              ['When', 'Monday morning. Nothing on the other six days.'],
              ['What', 'The week’s new pieces, with the short answer from each.'],
              ['Links', 'Affiliate links are labeled in the letter the same way they are on the site.'],
              ['Leaving', 'One click, at the bottom of every letter.'],
            ].map(([term, detail]) => (
              <div key={term} className="grid grid-cols-[6rem_1fr] gap-4 py-4 text-[15px] leading-relaxed">
                <dt className="font-bold">{term}</dt>
                <dd className="text-[var(--color-ink-2)]">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
