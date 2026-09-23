import Link from 'next/link';
import type { Category } from '~/lib/content';
import { SITE } from '~/lib/seo';
import { Wordmark } from './Wordmark';

export function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[var(--color-ink)]">
      <div className="container-grid grid gap-12 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-md font-serif text-[17px] italic leading-relaxed text-[var(--color-ink-70)]">
            {SITE.tagline} Sourced briefings and comparisons. Published by Riverra Labs LLP.
          </p>
        </div>
        <div>
          <p className="text-eyebrow">Sections</p>
          <ul className="mt-3 space-y-1 font-serif text-[16px]">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={category.href} className="inline-flex min-h-11 items-center hover:text-[var(--color-blue)]">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/archive/" className="inline-flex min-h-11 items-center hover:text-[var(--color-blue)]">
                Archive
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-eyebrow">The paper</p>
          <ul className="mt-3 space-y-1 font-serif text-[16px]">
            <li><Link className="inline-flex min-h-11 items-center" href="/about/">About</Link></li>
            <li><Link className="inline-flex min-h-11 items-center" href="/methodology/">How we test</Link></li>
            <li><Link className="inline-flex min-h-11 items-center" href="/contact/">Contact</Link></li>
            <li><Link className="inline-flex min-h-11 items-center" href="/disclosure/">Affiliate disclosure</Link></li>
            <li><Link className="inline-flex min-h-11 items-center" href="/privacy/">Privacy</Link></li>
            <li><Link className="inline-flex min-h-11 items-center" href="/terms/">Terms</Link></li>
            <li><Link className="inline-flex min-h-11 items-center" href="/rss.xml">RSS</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-grid flex flex-col gap-2 border-t border-[var(--color-ink-10)] py-6 font-sans text-[12px] text-[var(--color-ink-55)] sm:flex-row sm:justify-between">
        <p>© {year} Riverra Labs LLP. MorningStacks is the publication.</p>
        <p>
          Some links are affiliates.{' '}
          <Link href="/disclosure/" className="underline underline-offset-4">
            Read the disclosure
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
