import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleIndex } from '~/components/editorial/ArticleIndex';
import { Newsletter } from '~/components/editorial/Newsletter';
import { TypeBadge } from '~/components/editorial/TypeBadge';
import { formatDate, getCategories, getPublishedArticles } from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return {};
  return pageMetadata({
    title: `${category.name} · software for operators and founders`,
    description: category.description,
    path: category.href,
    ogSlug: `category-${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [categories, articles] = await Promise.all([getCategories(), getPublishedArticles()]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const inSection = articles.filter((article) => article.category === category.slug);
  const [lead, ...rest] = inSection;

  return (
    <>
      <header className="border-b border-[var(--color-ink)]">
        <div className="container-grid py-12 sm:py-16">
          <p className="text-eyebrow">Section</p>
          <h1 className="mt-3 font-serif text-[48px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[68px]">
            {category.name}
            <span className="text-[var(--color-blue)]">.</span>
          </h1>
          <p className="mt-5 max-w-[40rem] font-serif text-[20px] italic leading-relaxed text-[var(--color-ink-70)]">
            {category.description}
          </p>
        </div>
      </header>
      {lead ? (
        <section className="container-grid border-b border-[var(--color-ink-10)] py-12">
          <p className="flex flex-wrap items-center gap-x-2">
            <span className="text-eyebrow">Latest</span>
            <span aria-hidden="true" className="text-[var(--color-ink-25)]">
              ·
            </span>
            <TypeBadge type={lead.type} />
          </p>
          <h2 className="mt-3 max-w-[20ch] font-serif text-[34px] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[44px]">
            <Link href={lead.href} className="hover:text-[var(--color-blue)]">
              {lead.title}
            </Link>
          </h2>
          <p className="mt-4 max-w-[62ch] font-serif text-[18px] leading-relaxed text-[var(--color-ink-85)]">
            {lead.answer || lead.description}
          </p>
          <p className="mt-4 font-sans text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink-55)]">
            <time dateTime={lead.date}>{formatDate(lead.date)}</time>
          </p>
        </section>
      ) : null}
      <section className="container-grid py-12">
        {rest.length > 0 ? (
          <ArticleIndex articles={rest} />
        ) : !lead ? (
          <p className="font-serif text-[18px] italic text-[var(--color-ink-70)]">
            Nothing published in this section yet.
          </p>
        ) : null}
      </section>
      <div className="container-grid pb-16">
        <Newsletter source={`category-${category.slug}`} />
      </div>
    </>
  );
}
