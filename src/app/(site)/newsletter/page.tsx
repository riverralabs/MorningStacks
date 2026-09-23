import type { Metadata } from 'next';
import { Newsletter } from '~/components/editorial/Newsletter';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'The MorningStacks newsletter',
  description:
    'One short email when we have something worth sending. Not a live email service yet. Write to hello@morningstacks.com.',
  path: '/newsletter/',
  ogSlug: 'newsletter',
});

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const { status, reason } = await searchParams;
  return (
    <section className="container-grid py-16 sm:py-20">
      <p className="text-eyebrow">The newsletter</p>
      <h1 className="mt-3 max-w-[14ch] font-serif text-[48px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[68px]">
        Monday morning, in your inbox<span className="text-[var(--color-blue)]">.</span>
      </h1>
      <p className="mt-6 max-w-[40rem] font-serif text-[20px] italic leading-relaxed text-[var(--color-ink-70)]">
        Sourced briefings and comparisons, clearly labeled. Short. No fluff. The list is not live yet.
      </p>
      {status === 'success' ? (
        <p className="mt-8 font-serif text-[18px]">You are on the list.</p>
      ) : null}
      {status === 'invalid' ? (
        <p className="mt-8 font-serif text-[18px]">That email did not look right. Try again.</p>
      ) : null}
      {status === 'error' ? (
        <p className="mt-8 font-serif text-[18px]">
          The list did not take that address{reason ? ` (${reason})` : ''}.
        </p>
      ) : null}
      <div className="mt-12 max-w-[40rem]">
        <Newsletter source="newsletter-page" heading="Subscribe" />
      </div>
    </section>
  );
}
