import Link from 'next/link';
import type { Category } from '~/lib/content';
import { SITE } from '~/lib/seo';
import { Wordmark } from './Wordmark';

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-[13px] font-bold tracking-[0.08em] text-[var(--color-ink)] uppercase">{title}</h2>
      <ul className="mt-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-10 items-center text-[15px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:underline hover:underline-offset-4"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ categories }: { categories: Category[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t-[3px] border-[var(--color-ink)] bg-[var(--color-paper-2)]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <Wordmark className="h-[24px]" />
          <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">
            {SITE.tagline} An independent publication from Riverra Labs LLP.
          </p>
          <p className="mt-4 text-[15px]">
            <a href={`mailto:${SITE.email}`} className="link">
              {SITE.email}
            </a>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          <Column
            title="Sections"
            links={[
              ...categories.map((category) => ({ href: category.href, label: category.name })),
              { href: '/archive/', label: 'Archive' },
            ]}
          />
          <Column
            title="Publication"
            links={[
              { href: '/about/', label: 'About' },
              { href: '/methodology/', label: 'How we test' },
              { href: '/newsletter/', label: 'Newsletter' },
              { href: '/contact/', label: 'Contact' },
            ]}
          />
          <Column
            title="Policies"
            links={[
              { href: '/disclosure/', label: 'Affiliate disclosure' },
              { href: '/privacy/', label: 'Privacy policy' },
              { href: '/terms/', label: 'Terms and conditions' },
              { href: '/rss.xml', label: 'RSS feed' },
            ]}
          />
        </div>
      </div>
      <div className="border-t border-[var(--color-rule)]">
        <div className="container-page flex flex-col gap-2 py-5 text-[13px] text-[var(--color-ink-3)] sm:flex-row sm:justify-between">
          <p>© {year} Riverra Labs LLP. All rights reserved.</p>
          <p>
            Some links earn us a commission.{' '}
            <Link href="/disclosure/" className="underline underline-offset-2 hover:text-[var(--color-ink)]">
              Read the disclosure
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
