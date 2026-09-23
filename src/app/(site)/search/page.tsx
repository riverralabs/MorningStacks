import type { Metadata } from 'next';
import { SearchBox } from '~/components/search/SearchBox';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description: "Search every review, roundup, and editorial we've published.",
  path: '/search/',
  ogSlug: 'search',
  noindex: true,
});

export default function SearchPage() {
  return (
    <section className="container-article py-16" data-pagefind-ignore>
      <p className="text-eyebrow">Search the archive</p>
      <h1 className="mt-3 font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
        Find a tool, a roundup, an opinion<span className="text-[var(--color-blue)]">.</span>
      </h1>
      <p className="mt-5 font-serif text-[18px] italic leading-relaxed text-[var(--color-ink-70)]">
        Built-time index. Runs in your browser. No tracking.
      </p>
      <SearchBox />
      <style>{`
        #search .pagefind-ui__search-input {
          font-family: var(--font-serif);
          min-height: 44px;
          width: 100%;
          border: 0;
          border-bottom: 1px solid var(--color-ink);
          background: transparent;
          padding: 12px 0;
          font-size: 22px;
        }
        #search .pagefind-ui__search-input:focus {
          outline: none;
        }
        #search .pagefind-ui__result-title a {
          font-family: var(--font-serif);
          color: var(--color-ink);
          font-size: 22px;
        }
        #search .pagefind-ui__result-excerpt {
          font-family: var(--font-serif);
          color: var(--color-ink-70);
        }
        #search mark {
          background: rgba(30, 58, 95, 0.12);
          color: inherit;
        }
      `}</style>
    </section>
  );
}
