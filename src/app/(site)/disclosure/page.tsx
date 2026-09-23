import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage } from '~/components/stories/DocPage';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Affiliate disclosure',
  description:
    'MorningStacks may earn a commission on some links to vendor sites. This page explains how that works. Draft. Not legal advice.',
  path: '/disclosure/',
  ogSlug: 'disclosure',
});

export default function DisclosurePage() {
  return (
    <DocPage path="/disclosure/" title="Affiliate disclosure" summary="How affiliate links work on MorningStacks, and what they never influence." updated="Last updated September 2026. Draft. Not legal advice.">
      <p>
        <strong>In one sentence:</strong> we may earn a commission if you buy after clicking some links on this
        site. That commission does not change the verdict, the score, or what we choose to cover.
      </p>
      <p>
        This is a working draft for an affiliate publication. It is not legal advice. Questions go to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>Plain language</h2>
      <p>
        MorningStacks is published by Riverra Labs LLP. Some buttons on this site point at{' '}
        <code>/go/</code> and then redirect to the vendor or its affiliate network. If you then buy or start a
        paid plan, that vendor or network may pay Riverra Labs LLP a commission. You do not pay more because you
        used our link.
      </p>
      <p>
        A program URL that already carries affiliate parameters is used as the network provided it. We do not
        rewrite it. A vendor address with no affiliate parameters is not presented as a paid link.
      </p>
      <p>
        Not every link is an affiliate link. Source citations stay ordinary links. Legal pages, this disclosure,
        methodology, and our own site pages do not use <code>/go/</code>.
      </p>
      <h2>What affiliate links do not influence</h2>
      <ul>
        <li>
          <strong>What we cover.</strong> Vendors cannot pay to be reviewed, included in a roundup, or featured
          in the newsletter.
        </li>
        <li>
          <strong>What we say.</strong> Vendors do not review our pieces before publication. We may share a
          fact-check excerpt for a spec. They do not see the verdict first.
        </li>
      </ul>
      <h2>How we mark links</h2>
      <p>
        This disclosure is meant to follow the U.S. Federal Trade Commission&apos;s Guides Concerning the Use of
        Endorsements and Testimonials in Advertising (16 CFR Part 255). Reviews include an inline note at the top
        of the page, in addition to this site-wide page. Paid links are marked in the page source with{' '}
        <code>rel=&quot;sponsored&quot;</code> and point at <code>/go/</code> before the vendor. We do not add an
        advertising pixel on that redirect.
      </p>
      <h2>Programs</h2>
      <p>
        The list of vendor programs changes. We do not publish an application status or a roster of pending
        deals. For a dated list of current relationships, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>Problems</h2>
      <p>
        If you spot an undisclosed affiliate link, write to <Link href="/contact/">contact</Link> or {SITE.email}.
        We will correct it on the page.
      </p>
    </DocPage>
  );
}
