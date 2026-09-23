import Link from 'next/link';
import type { Category } from '~/lib/content';
import { SITE } from '~/lib/seo';
import { SectionNav } from './SectionNav';
import { Wordmark } from './Wordmark';

export function Masthead({ categories }: { categories: Category[] }) {
  return (
    <header>
      <div className="bg-[var(--color-navy)] text-[var(--color-white)]">
        <p className="container-page py-2.5 text-[13px] leading-snug">
          Some links on MorningStacks earn us a commission. That never changes what we recommend.{' '}
          <Link href="/disclosure/" className="font-semibold whitespace-nowrap underline underline-offset-2">
            How we make money
          </Link>
        </p>
      </div>
      <div className="container-page flex items-center justify-between gap-4 py-4 md:py-6">
        <div className="min-w-0">
          <Wordmark />
          <p className="mt-1 hidden text-[14px] text-[var(--color-ink-2)] sm:block">{SITE.tagline}</p>
        </div>
        <div className="flex flex-none items-center gap-1 sm:gap-4">
          <Link
            href="/search/"
            className="inline-flex min-h-11 items-center px-2 text-[15px] font-semibold hover:underline hover:underline-offset-4"
          >
            Search
          </Link>
          <Link href="/newsletter/" className="btn btn-primary">
            <span className="sm:hidden">Newsletter</span>
            <span className="hidden sm:inline">Get the Monday letter</span>
          </Link>
        </div>
      </div>
      <SectionNav
        sections={categories.map((category) => ({ href: category.href, label: category.name }))}
        pages={[
          { href: '/archive/', label: 'Archive' },
          { href: '/about/', label: 'About' },
        ]}
      />
    </header>
  );
}
