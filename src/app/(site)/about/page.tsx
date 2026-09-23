import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage } from '~/components/stories/DocPage';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About MorningStacks',
  description:
    'MorningStacks is an independent publication about the SaaS, AI, and developer tools operators and founders pay for. Published by Riverra Labs LLP.',
  path: '/about/',
  ogSlug: 'about',
});

export default function AboutPage() {
  return (
    <DocPage
      path="/about/"
      title="About MorningStacks"
      summary="Straight answers on the software you pay for, written for operators and founders."
    >
      <p>
        MorningStacks covers the software a small company actually pays for: SaaS, AI tools, marketing tools, and
        developer infrastructure. Each piece answers a buying question. What does it cost, what is it good at, where
        does it fall short, and is it worth the money for a team like yours.
      </p>
      <h2>What we publish</h2>
      <p>Every piece is labeled with one of four formats, so you know what kind of evidence is behind it.</p>
      <ul>
        <li>
          <strong>Briefings</strong> cover a change, such as a price increase or a product being cut, and what to do
          about it.
        </li>
        <li>
          <strong>Roundups</strong> put tools side by side with current prices, trade-offs, and a pick.
        </li>
        <li>
          <strong>Explainers</strong> show how a product, plan, or price works.
        </li>
        <li>
          <strong>Reviews</strong> cover one tool used in real work, with a last-tested date.
        </li>
      </ul>
      <p>
        Briefings, roundups, and explainers are sourced from vendor pages and public documents, listed at the end of
        each piece with the date we checked them. Only a review claims hands-on testing. The standard for that is on
        the <Link href="/methodology/">How we test</Link> page.
      </p>
      <h2>Sections</h2>
      <p>
        <Link href="/productivity/">Productivity</Link>, <Link href="/ai-tools/">AI Tools</Link>,{' '}
        <Link href="/marketing/">Marketing</Link>, and <Link href="/developer-tools/">Developer Tools</Link>. The{' '}
        <Link href="/archive/">archive</Link> lists every published piece.
      </p>
      <h2>How we make money</h2>
      <p>
        Affiliate commissions on some links to vendor sites. A commission never decides a verdict, a rating, or what
        we cover. We do not sell sponsored posts or placements. The <Link href="/disclosure/">affiliate disclosure</Link>{' '}
        explains the details.
      </p>
      <h2>How we write</h2>
      <p>
        Plainly, with numbers. We name prices and the date we checked them. We say when a tool is not worth it. If we
        get something wrong, we correct the piece and date the correction.
      </p>
      <h2>Publisher</h2>
      <p>
        MorningStacks is published by {SITE.publisher}. Write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </DocPage>
  );
}
