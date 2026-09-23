import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage } from '~/components/stories/DocPage';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms and conditions',
  description:
    'The terms for reading and using MorningStacks: what our writing is, how affiliate links work, what you may reuse, and the limits of our liability.',
  path: '/terms/',
  ogSlug: 'terms',
});

export default function TermsPage() {
  return (
    <DocPage
      path="/terms/"
      title="Terms and conditions"
      summary="The rules for reading and using MorningStacks, in plain language."
      updated="Last updated September 2026. Draft. Not legal advice."
    >
      <p>
        This is a working draft for an affiliate publication. It is not legal advice. Questions go to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>The site</h2>
      <p>
        MorningStacks is an editorial site about software, published by {SITE.publisher}. By using the site you agree
        to these terms.
      </p>
      <h2>What the writing is</h2>
      <p>
        Reviews, comparisons, and other pieces are our opinion at the time they are published. Software changes and
        prices change. We update pieces when we catch an error. We do not promise that a tool will work for you, or
        that a price on a vendor site still matches what we recorded.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Some links are affiliate links. If you buy after clicking, {SITE.publisher} may earn a commission. Your price
        does not change because you used our link. Details are on the{' '}
        <Link href="/disclosure/">affiliate disclosure</Link>.
      </p>
      <h2>Your use</h2>
      <p>
        You may read, share links, and quote short passages with attribution. You may not scrape the site to republish
        our reviews as your own, or imply that we endorse a product we have not reviewed.
      </p>
      <h2>Third-party sites</h2>
      <p>
        Links to vendors and sources take you to sites we do not control. Their terms and privacy policies apply once
        you are there.
      </p>
      <h2>No professional advice</h2>
      <p>Nothing on MorningStacks is legal, tax, investment, or other professional advice. It is journalism about software.</p>
      <h2>Limitation</h2>
      <p>
        The site is provided as is. {SITE.publisher} is not liable for decisions you make after reading a piece, for
        downtime, or for a vendor changing a product after we wrote about it.
      </p>
      <h2>Changes</h2>
      <p>When these terms change, we update this page and the date below.</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
    </DocPage>
  );
}
