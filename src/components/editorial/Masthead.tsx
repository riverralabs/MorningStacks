import Link from 'next/link';
import type { Category } from '~/lib/content';
import { Wordmark } from './Wordmark';

export function Masthead({
  categories,
  issue,
}: {
  categories: Category[];
  issue: string;
}) {
  const links = [
    ...categories.map((category) => ({ href: category.href, label: category.name })),
    { href: '/archive/', label: 'Archive' },
    { href: '/about/', label: 'About' },
    { href: '/newsletter/', label: 'Letter' },
  ];

  return (
    <header className="border-b border-[var(--color-ink)]">
      <div className="container-grid flex items-end justify-between gap-6 py-5">
        <Wordmark size="lg" />
        <p className="hidden text-right font-sans text-[12px] uppercase tracking-[0.16em] text-[var(--color-ink-55)] sm:block">
          {issue}
        </p>
      </div>
      <nav aria-label="Primary" className="border-t border-[var(--color-ink-15)]">
        <ul className="container-grid flex gap-x-6 gap-y-1 overflow-x-auto py-2 font-sans text-[13px] font-medium tracking-[0.04em] text-[var(--color-ink-85)]">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex min-h-11 items-center hover:text-[var(--color-blue)]">
                {link.label}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link href="/search/" className="inline-flex min-h-11 items-center hover:text-[var(--color-blue)]">
              Search
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
