import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleIndex } from '~/components/editorial/ArticleIndex';
import { Newsletter } from '~/components/editorial/Newsletter';
import { goHref, isActiveProgram } from '~/lib/affiliate';
import { TYPE_ORDER, typeLabel } from '~/lib/content-model';
import { getCategories, getProducts, getPublishedArticles } from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  description: SITE.description,
  path: '/',
  ogSlug: 'default',
});

export default async function HomePage() {
  const [articles, categories, products] = await Promise.all([
    getPublishedArticles(),
    getCategories(),
    getProducts(),
  ]);
  const promoted = products.filter((product) => isActiveProgram(product));
  const toolGroups = categories
    .map((category) => ({
      category,
      rows: promoted.filter((product) => product.category === category.slug),
    }))
    .filter((group) => group.rows.length > 0);
  const writing = TYPE_ORDER.map((type) => ({
    type,
    rows: articles.filter((article) => article.type === type),
  })).filter((group) => group.rows.length > 0);

  return (
    <>
      <section className="border-b border-[var(--color-ink)]">
        <div className="container-grid py-12 sm:py-16">
          <p className="text-eyebrow">Tools</p>
          <h1 className="mt-4 max-w-[16ch] font-serif text-[40px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[56px]">
            The stack we promote
          </h1>
          <p className="mt-6 max-w-[62ch] font-serif text-[18px] leading-[1.5] text-[var(--color-ink-85)]">
            Some of these links are affiliate links. They go through MorningStacks, then to the vendor. If you
            buy, we may earn a commission. You do not pay more.{' '}
            <Link href="/disclosure/" className="text-[var(--color-blue)] underline underline-offset-4">
              How this works.
            </Link>
          </p>
          {toolGroups.length === 0 ? (
            <p className="mt-10 font-serif text-[20px] italic text-[var(--color-ink-70)]">
              The stack is still being set.
            </p>
          ) : (
            toolGroups.map((group) => (
              <div key={group.category.slug} className="mt-12">
                <h2 className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
                  {group.category.name}
                </h2>
                <ul className="mt-3 divide-y divide-[var(--color-ink-10)] border-y border-[var(--color-ink-10)]">
                  {group.rows.map((product) => (
                    <li
                      key={product.slug}
                      className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-10"
                    >
                      <div>
                        <h3 className="font-serif text-[26px] font-medium leading-[1.15] tracking-[-0.02em]">
                          {product.name}
                        </h3>
                        <p className="mt-2 max-w-[62ch] font-serif text-[17px] leading-relaxed text-[var(--color-ink-70)]">
                          {product.summary}
                        </p>
                        <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink-55)]">
                          {product.price}
                        </p>
                      </div>
                      <a
                        href={goHref(product.slug)}
                        rel="sponsored noopener"
                        target="_blank"
                        className="inline-flex min-h-11 items-center justify-center border border-[var(--color-ink)] px-4 font-sans text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
                      >
                        Try {product.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="container-grid py-14">
        <h2 className="font-serif text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--color-ink-55)]">
          Writing
        </h2>
        <p className="mt-4 max-w-[62ch] font-serif text-[18px] leading-relaxed text-[var(--color-ink-70)]">
          Briefings, roundups, explainers, and reviews. This list is the paper, separate from the tools above.
        </p>
        {writing.length === 0 ? (
          <p className="mt-10 font-serif text-[18px] italic text-[var(--color-ink-70)]">
            Nothing published yet.
          </p>
        ) : (
          writing.map((group) => (
            <div key={group.type} className="mt-10">
              <h3 className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
                {typeLabel(group.type)}
              </h3>
              <div className="mt-3">
                <ArticleIndex articles={group.rows} showType={false} />
              </div>
            </div>
          ))
        )}
      </section>

      <section className="border-y border-[var(--color-ink-10)]">
        <div className="container-grid py-8">
          <p className="text-eyebrow">Sections</p>
          <nav aria-label="Sections" className="mt-3 flex flex-wrap gap-x-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="inline-flex min-h-11 items-center font-serif text-[18px] hover:text-[var(--color-blue)]"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="container-grid py-16">
        <Newsletter source="home" />
      </div>
    </>
  );
}
