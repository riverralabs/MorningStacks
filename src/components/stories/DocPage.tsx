import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageHead } from './Story';

const PAGES = [
  { href: '/about/', label: 'About' },
  { href: '/methodology/', label: 'How we test' },
  { href: '/disclosure/', label: 'Affiliate disclosure' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy/', label: 'Privacy policy' },
  { href: '/terms/', label: 'Terms and conditions' },
];

export function DocPage({
  path,
  title,
  summary,
  updated,
  children,
}: {
  path: string;
  title: string;
  summary?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHead
        crumbs={[
          { href: '/', label: 'Front page' },
          { href: path, label: title },
        ]}
        title={title}
        description={summary}
      />
      <div className="container-page section-y grid gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="prose-ms max-w-[var(--container-prose)]">{children}</div>
          {updated ? <p className="meta mt-12 border-t border-[var(--color-rule)] pt-4">{updated}</p> : null}
        </div>
        <nav aria-label="The publication" className="lg:col-span-3 lg:col-start-10">
          <p className="border-t-[3px] border-[var(--color-ink)] pt-3 text-[13px] font-extrabold tracking-[0.08em] uppercase">
            The publication
          </p>
          <ul className="mt-2">
            {PAGES.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  aria-current={page.href === path ? 'page' : undefined}
                  className="inline-flex min-h-10 items-center text-[15px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:underline hover:underline-offset-4 aria-[current=page]:font-bold aria-[current=page]:text-[var(--color-ink)]"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
