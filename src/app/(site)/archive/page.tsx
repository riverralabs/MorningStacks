import type { Metadata } from 'next';
import { ArticleIndex } from '~/components/editorial/ArticleIndex';
import { Newsletter } from '~/components/editorial/Newsletter';
import { getPublishedArticles } from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Archive',
  description: 'Every published MorningStacks piece, newest first. Drafts and templates stay off this list.',
  path: '/archive/',
  ogSlug: 'archive',
});

export default async function ArchivePage() {
  const articles = await getPublishedArticles();
  return (
    <>
      <header className="border-b border-[var(--color-ink)]">
        <div className="container-grid py-12 sm:py-16">
          <p className="text-eyebrow">Archive</p>
          <h1 className="mt-3 font-serif text-[48px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[68px]">
            All writing<span className="text-[var(--color-blue)]">.</span>
          </h1>
          <p className="mt-5 max-w-[40rem] font-serif text-[20px] italic leading-relaxed text-[var(--color-ink-70)]">
            Published pieces only. Drafts and templates stay off this list.
          </p>
        </div>
      </header>
      <section className="container-grid py-12">
        <ArticleIndex articles={articles} />
      </section>
      <div className="container-grid pb-16">
        <Newsletter source="archive" />
      </div>
    </>
  );
}
