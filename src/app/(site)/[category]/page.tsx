import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsletterBand } from '~/components/newsletter/Newsletter';
import { ModuleHead, PageHead, StoryItem, StoryRow, storyContext } from '~/components/stories/Story';
import { formatShortDate, getCategories, getPublishedArticles } from '~/lib/content';
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
    title: `${category.name}: briefings and comparisons`,
    description: category.description,
    path: category.href,
    ogSlug: `category-${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const [categories, articles, context] = await Promise.all([
    getCategories(),
    getPublishedArticles(),
    storyContext(),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const inSection = articles.filter((article) => article.category === category.slug);
  const [lead, ...rest] = inSection;
  const others = categories.filter((item) => item.slug !== category.slug);
  const count = inSection.length;

  return (
    <>
      <PageHead
        crumbs={[
          { href: '/', label: 'Front page' },
          { href: category.href, label: category.name },
        ]}
        title={category.name}
        description={category.description}
        meta={
          count > 0
            ? `${count} ${count === 1 ? 'piece' : 'pieces'} · latest ${formatShortDate(lead?.date)}`
            : 'Nothing published here yet'
        }
      />

      {lead ? (
        <section aria-label="Latest in this section" className="container-page section-y">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <StoryItem article={lead} context={context} size="lg" excerpt withSection={false} />
            </div>
          </div>
          {rest.length > 0 ? (
            <div className="mt-12">
              <ModuleHead title={`More in ${category.name}`} />
              <ol className="divide-y divide-[var(--color-rule)]">
                {rest.map((article) => (
                  <li key={article.slug}>
                    <StoryRow article={article} context={context} />
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="container-page section-y">
          <p className="max-w-[60ch] text-[17px] text-[var(--color-ink-2)]">
            Nothing is published in {category.name} yet. The{' '}
            <Link href="/archive/" className="link">
              archive
            </Link>{' '}
            lists everything else.
          </p>
        </section>
      )}

      <nav aria-label="Other sections" className="border-t border-[var(--color-rule)]">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 py-6">
          <span className="text-[14px] font-extrabold tracking-[0.08em] uppercase">Other sections</span>
          {others.map((item) => (
            <Link key={item.slug} href={item.href} className="link inline-flex min-h-11 items-center text-[15px] font-semibold">
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      <NewsletterBand source={`category-${category.slug}`} />
    </>
  );
}
