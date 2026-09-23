import type { Metadata } from 'next';
import Link from 'next/link';
import { Paper } from '~/components/editorial/Paper';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About MorningStacks',
  description:
    'MorningStacks is an independent publication about software that operators and founders actually pay for. Published by Riverra Labs LLP.',
  path: '/about/',
  ogSlug: 'about',
});

export default function AboutPage() {
  return (
    <Paper eyebrow="About" title="About MorningStacks">
      <p>
        MorningStacks is an independent publication about the software stack that operators and founders
        actually pay for. SaaS, AI tools, and infrastructure. Editorial first, commerce second.
      </p>
      <h2>Publisher</h2>
      <p>
        The publication is published by Riverra Labs LLP. The public contact for the site is{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>What we cover</h2>
      <p>
        Four sections: <Link href="/productivity/">Productivity</Link>, <Link href="/ai-tools/">AI Tools</Link>,{' '}
        <Link href="/marketing/">Marketing</Link>, and <Link href="/developer-tools/">Developer Tools</Link>. The{' '}
        <Link href="/archive/">archive</Link> lists every published piece.
      </p>
      <h2>How we make money</h2>
      <p>
        Affiliate commissions on some links to vendor sites. Commissions do not set the verdict or the coverage
        list. We do not sell sponsored posts. The <Link href="/disclosure/">affiliate disclosure</Link> is the full
        version.
      </p>
      <h2>How we work</h2>
      <p>
        Most live pieces are sourced operator briefings and comparisons, clearly labeled. A review is only a
        review when the type is review and the piece names a last-tested date or an explicit test method. The{' '}
        <Link href="/methodology/">methodology</Link> page is that standard. If a piece does not meet it,{' '}
        <Link href="/contact/">tell us</Link>.
      </p>
    </Paper>
  );
}
