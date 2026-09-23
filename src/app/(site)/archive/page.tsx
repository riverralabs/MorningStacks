import type { Metadata } from 'next';
import { NewsletterBand } from '~/components/newsletter/Newsletter';
import { ModuleHead, PageHead, StoryRow, storyContext } from '~/components/stories/Story';
import { getPublishedArticles, monthLabel, type Article } from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Archive: every published piece',
  description:
    'Every published MorningStacks briefing, roundup, explainer, and review, newest first, grouped by month. Drafts and templates stay off this list.',
  path: '/archive/',
  ogSlug: 'archive',
});

export default async function ArchivePage() {
  const [articles, context] = await Promise.all([getPublishedArticles(), storyContext()]);
  const months = new Map<string, Article[]>();
  for (const article of articles) {
    const key = article.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), article]);
  }

  return (
    <>
      <PageHead
        crumbs={[
          { href: '/', label: 'Front page' },
          { href: '/archive/', label: 'Archive' },
        ]}
        title="Archive"
        description="Every published piece, newest first. Drafts and templates stay off this list."
        meta={`${articles.length} ${articles.length === 1 ? 'piece' : 'pieces'}`}
      />
      <div className="container-page section-y space-y-12">
        {[...months.entries()].map(([key, rows]) => (
          <section key={key} aria-labelledby={`month-${key}`}>
            <ModuleHead id={`month-${key}`} title={monthLabel(`${key}-01`)} />
            <ol className="divide-y divide-[var(--color-rule)]">
              {rows.map((article) => (
                <li key={article.slug}>
                  <StoryRow article={article} context={context} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <NewsletterBand source="archive" />
    </>
  );
}
