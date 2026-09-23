'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string };

export function SectionNav({ sections, pages }: { sections: NavItem[]; pages: NavItem[] }) {
  const pathname = usePathname() ?? '/';
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(href);

  const item = (link: NavItem) => (
    <li key={link.href} className="flex">
      <Link
        href={link.href}
        aria-current={isCurrent(link.href) ? 'page' : undefined}
        className="inline-flex min-h-12 items-center border-b-[3px] border-transparent pt-[3px] text-[15px] font-semibold text-[var(--color-ink)] hover:border-[var(--color-rule)] aria-[current=page]:border-[var(--color-ink)]"
      >
        {link.label}
      </Link>
    </li>
  );

  return (
    <nav aria-label="Sections" className="border-y border-[var(--color-rule)] bg-[var(--color-paper)]">
      <div className="container-page">
        <ul className="-mx-1 flex gap-x-6 overflow-x-auto px-1 whitespace-nowrap md:gap-x-8">
          {sections.map(item)}
          <li aria-hidden="true" className="my-3.5 w-px flex-none bg-[var(--color-rule)]" />
          {pages.map(item)}
        </ul>
      </div>
    </nav>
  );
}
