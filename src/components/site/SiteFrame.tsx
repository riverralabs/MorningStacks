import type { ReactNode } from 'react';
import { JsonLd } from '~/components/editorial/JsonLd';
import { getCategories } from '~/lib/content';
import { organizationSchema, websiteSchema } from '~/lib/schema';
import { Footer } from './Footer';
import { Masthead } from './Masthead';

export async function SiteFrame({ children }: { children: ReactNode }) {
  const categories = await getCategories();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:bg-[var(--color-ink)] focus-visible:px-4 focus-visible:py-3 focus-visible:text-[var(--color-paper)]"
      >
        Skip to content
      </a>
      <Masthead categories={categories} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
    </>
  );
}
