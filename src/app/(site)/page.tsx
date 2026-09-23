import type { Metadata } from 'next';
import { ArticleIndex } from '~/components/editorial/ArticleIndex';
import { Newsletter } from '~/components/editorial/Newsletter';
import { TypeBadge } from '~/components/editorial/TypeBadge';
import { TYPE_ORDER, typeLabel } from '~/lib/content-model';
import { formatDate, getCategories, getPublishedArticles, issueDate } from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = pageMetadata({
  description: SITE.description,
  path: '/',
  ogSlug: 'default',
});

export default async function HomePage() {
  const [articles, categories] = await Promise.all([getPublishedArticles(), getCategories()]);
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const rest = articles.filter((article) => article.slug !== featured?.slug);
  const grouped = TYPE_ORDER.map((type) => ({
    type,
    rows: rest.filter((article) => article.type === type),
  })).filter((group) => group.rows.length > 0);

  return (
    <>
      {featured ? (
        <section className="border-b border-[var(--color-ink)]">
          <div className="container-grid py-12 sm:py-16">
            <p className="text-eyebrow">
              Featured · {issueDate()}
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-2">
              <TypeBadge type={featured.type} />
              <span aria-hidden="true" className="text-[var(--color-ink-25)]">
                ·
              </span>
              <span className="text-eyebrow">{featured.eyebrow}</span>
            </p>
            <h1 className="mt-3 max-w-[18ch] font-serif text-[40px] font-medium leading-[1.02] tracking-[-0.03em] sm:text-[64px]">
              <Link href={featured.href} className="hover:text-[var(--color-blue)]">
                {featured.title}
              </Link>
            </h1>
            <p className="mt-6 max-w-[62ch] font-serif text-[20px] leading-[1.5] text-[var(--color-ink)] sm:text-[22px]">
              {featured.answer || featured.description}
            </p>
            <p className="mt-6 font-sans text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink-55)]">
              <time dateTime={featured.date}>{formatDate(featured.date)}</time>
              <span aria-hidden="true"> · </span>
              <Link href={featured.href} className="underline underline-offset-4 hover:text-[var(--color-blue)]">
                Read the piece
              </Link>
            </p>
          </div>
        </section>
      ) : (
        <section className="container-grid py-16">
          <h1 className="font-serif text-[40px] font-medium">This issue is still being set.</h1>
        </section>
      )}

      {grouped.length > 0 ? (
        <section className="container-grid py-14">
          <h2 className="font-serif text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--color-ink-55)]">
            In this issue
          </h2>
          {grouped.map((group) => (
            <div key={group.type} className="mt-10">
              <h3 className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
                {typeLabel(group.type)}
              </h3>
              <div className="mt-3">
                <ArticleIndex articles={group.rows} showType={false} />
              </div>
            </div>
          ))}
        </section>
      ) : null}

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
