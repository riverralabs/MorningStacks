import type { Metadata } from 'next';
import { SearchBox } from '~/components/search/SearchBox';
import { PageHead } from '~/components/stories/Story';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: 'Search every published MorningStacks briefing, roundup, explainer, and review.',
  path: '/search/',
  ogSlug: 'search',
  noindex: true,
});

export default function SearchPage() {
  return (
    <div data-pagefind-ignore>
      <PageHead
        crumbs={[
          { href: '/', label: 'Front page' },
          { href: '/search/', label: 'Search' },
        ]}
        title="Search"
        description="Search every published piece by tool, price, or question. The index is built with the site and runs in your browser."
      />
      <section className="container-page section-y">
        <div className="max-w-[46rem]">
          <SearchBox />
        </div>
      </section>
    </div>
  );
}
