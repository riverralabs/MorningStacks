import type { ReactNode } from 'react';
import { getCategories, issueDate } from '~/lib/content';
import { organizationSchema, websiteSchema } from '~/lib/schema';
import { Footer } from './Footer';
import { JsonLd } from './JsonLd';
import { Masthead } from './Masthead';

export async function SiteFrame({ children }: { children: ReactNode }) {
  const categories = await getCategories();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:bg-[var(--color-blue)] focus-visible:px-4 focus-visible:py-2 focus-visible:text-[var(--color-cream)]"
      >
        Skip to content
      </a>
      <Masthead categories={categories} issue={issueDate()} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
    </>
  );
}
