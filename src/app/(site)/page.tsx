import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsletterBand } from '~/components/newsletter/Newsletter';
import { LeadStory, ModuleHead, StoryItem, storyContext } from '~/components/stories/Story';
import { goHref, isActiveProgram } from '~/lib/affiliate';
import { TYPE_ORDER, type ArticleType } from '~/lib/content-model';
import { formatShortDate, getCategories, getProducts, getPublishedArticles, type Product } from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  description: SITE.description,
  path: '/',
  ogSlug: 'default',
});

const FORMATS: Record<ArticleType, { plural: string; about: string }> = {
  briefing: { plural: 'Briefings', about: 'What changed, what it means, and what to do about it this week.' },
  roundup: { plural: 'Roundups', about: 'Tools side by side, with current prices, trade-offs, and a pick.' },
  explainer: { plural: 'Explainers', about: 'How a product, plan, or price works, in plain terms.' },
  review: { plural: 'Reviews', about: 'One tool used in real work, with a last-tested date.' },
};

function StackRow({ product }: { product: Product }) {
  return (
    <li className="grid gap-4 border-t border-[var(--color-rule)] py-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-[length:var(--text-head-sm)] font-bold tracking-[var(--text-head-sm--letter-spacing)]">
          {product.name}
        </p>
        <p className="mt-1 max-w-[52ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">{product.summary}</p>
        {product.price ? <p className="meta mt-1.5">{product.price}</p> : null}
      </div>
      <a href={goHref(product.slug)} rel="sponsored noopener" target="_blank" className="btn btn-secondary">
        Try {product.name}
      </a>
    </li>
  );
}

export default async function HomePage() {
  const [articles, categories, products, context] = await Promise.all([
    getPublishedArticles(),
    getCategories(),
    getProducts(),
    storyContext(),
  ]);

  const lead = articles.find((article) => article.featured) ?? articles[0];
  const latest = articles.filter((article) => article !== lead).slice(0, 5);

  const promoted = products.filter((product) => isActiveProgram(product));
  const stack = categories
    .map((category) => ({ category, rows: promoted.filter((product) => product.category === category.slug) }))
    .filter((group) => group.rows.length > 0);

  const formats = TYPE_ORDER.map((type) => ({
    type,
    rows: articles.filter((article) => article.type === type),
  })).filter((group) => group.rows.length > 0);

  const sections = categories.map((category) => {
    const inSection = articles.filter((article) => article.category === category.slug);
    return { category, count: inSection.length, latest: inSection[0]?.date };
  });

  return (
    <>
      <h1 className="sr-only">
        {SITE.name}: {SITE.tagline}
      </h1>

      <section aria-label="Top stories" className="container-page pt-8 pb-12 md:pt-10 md:pb-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-8 lg:border-r lg:border-[var(--color-rule)] lg:pr-10">
            {lead ? (
              <LeadStory article={lead} context={context} />
            ) : (
              <p className="text-[length:var(--text-head-md)] font-bold">Nothing published yet.</p>
            )}
          </div>
          <div className="lg:col-span-4 lg:pl-10">
            <ModuleHead title="Latest" link={{ href: '/archive/', label: 'Archive' }} />
            <ol className="mt-2">
              {latest.map((article) => (
                <li key={article.slug} className="border-b border-[var(--color-rule)] py-5 last:border-b-0">
                  <StoryItem article={article} context={context} size="sm" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="stack" className="border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]">
        <div className="container-page section-y">
          <ModuleHead id="stack" title="The stack" link={{ href: '/methodology/', label: 'How we choose tools' }} />
          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[length:var(--text-head-md)] leading-[var(--text-head-md--line-height)] font-extrabold tracking-[var(--text-head-md--letter-spacing)]">
                Tools we recommend, by section.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-2)]">
                Links in this list are affiliate links. They go through a MorningStacks address, then to the vendor.
                If you buy, we may earn a commission. You do not pay more.{' '}
                <Link href="/disclosure/" className="link font-semibold">
                  How this works
                </Link>
              </p>
            </div>
            <div className="lg:col-span-8">
              {stack.length === 0 ? (
                <div className="border border-[var(--color-rule)] bg-[var(--color-white)] p-6 md:p-8">
                  <p className="text-[length:var(--text-head-md)] font-extrabold tracking-[var(--text-head-md--letter-spacing)]">
                    The stack is still being set.
                  </p>
                  <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-[var(--color-ink-2)]">
                    A tool is listed here once we have joined its affiliate program and it has earned a place in our
                    writing. Until then, product links on this site go to the vendor’s own website.
                  </p>
                </div>
              ) : (
                <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
                  {stack.map((group) => (
                    <section key={group.category.slug} aria-labelledby={`stack-${group.category.slug}`}>
                      <h3
                        id={`stack-${group.category.slug}`}
                        className="text-[14px] font-extrabold tracking-[0.08em] uppercase"
                      >
                        <Link href={group.category.href} className="headline-link">
                          {group.category.name}
                        </Link>
                      </h3>
                      <ul className="mt-3 border-b border-[var(--color-rule)]">
                        {group.rows.map((product) => (
                          <StackRow key={product.slug} product={product} />
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="formats" className="container-page section-y">
        <ModuleHead id="formats" title="Writing, by format" link={{ href: '/archive/', label: 'Full archive' }} />
        {formats.map((group) => (
          <div
            key={group.type}
            className="grid gap-6 border-b border-[var(--color-rule)] py-8 last:border-b-0 lg:grid-cols-12 lg:gap-10"
          >
            <div className="lg:col-span-3">
              <h3 className="text-[length:var(--text-head-lg)] leading-[var(--text-head-lg--line-height)] font-extrabold tracking-[var(--text-head-lg--letter-spacing)]">
                {FORMATS[group.type].plural}
              </h3>
              <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">
                {FORMATS[group.type].about}
              </p>
              <p className="meta mt-3">
                {group.rows.length} {group.rows.length === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
            <ol className="grid gap-x-10 md:grid-cols-2 lg:col-span-9">
              {group.rows.map((article) => (
                <li key={article.slug} className="border-t border-[var(--color-rule)] py-5 first:border-t-0 md:[&:nth-child(2)]:border-t-0">
                  <StoryItem article={article} context={context} size="sm" />
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section aria-labelledby="sections" className="border-t border-[var(--color-rule)]">
        <div className="container-page section-y">
          <ModuleHead id="sections" title="Sections" />
          <ul className="mt-6 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[var(--color-rule)]">
            {sections.map(({ category, count, latest: last }) => (
              <li key={category.slug} className="sm:pr-8 lg:px-8 lg:first:pl-0 lg:last:pr-0">
                <h3 className="text-[length:var(--text-head-md)] font-extrabold tracking-[var(--text-head-md--letter-spacing)]">
                  <Link href={category.href} className="headline-link">
                    {category.name}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-2)]">{category.description}</p>
                <p className="meta mt-3">
                  {count} {count === 1 ? 'piece' : 'pieces'}
                  {last ? ` · latest ${formatShortDate(last)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <NewsletterBand source="home" />
    </>
  );
}
