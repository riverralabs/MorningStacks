import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleView, articleOgPath } from '~/components/article/ArticleView';
import {
  getAuthors,
  getBuildableArticles,
  getCategories,
  getProducts,
  getPublishedArticles,
} from '~/lib/content';
import { pageMetadata } from '~/lib/metadata';
import { ogImage } from '~/lib/seo';

export async function generateStaticParams() {
  const articles = await getBuildableArticles();
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const articles = await getBuildableArticles();
  const article = articles.find((item) => item.category === category && item.slug === slug);
  if (!article) return {};
  const published = `${article.date.slice(0, 10)}T00:00:00.000Z`;
  const modified = article.updated ? `${article.updated.slice(0, 10)}T00:00:00.000Z` : undefined;
  return pageMetadata({
    title: article.title,
    ogTitle: article.ogTitle ?? undefined,
    description: article.description,
    path: article.href,
    ogSlug: articleOgPath(article),
    ogImageUrl: ogImage(articleOgPath(article)),
    noindex: article.visibility !== 'published',
    type: 'article',
    publishedTime: published,
    modifiedTime: modified,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category: categorySlug, slug } = await params;
  const [articles, categories, authors, catalog, published] = await Promise.all([
    getBuildableArticles(),
    getCategories(),
    getAuthors(),
    getProducts(),
    getPublishedArticles(),
  ]);
  const article = articles.find((item) => item.category === categorySlug && item.slug === slug);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!article || !category) notFound();
  const author = authors.find((item) => item.slug === article.authorSlug);
  if (!author) notFound();
  const products = article.products
    .map((id) => catalog.find((product) => product.slug === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const linked = article.related
    .map((id) => published.find((item) => item.slug === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const related =
    linked.length > 0
      ? linked
      : published.filter((item) => item.slug !== article.slug && item.category === article.category);

  return (
    <ArticleView
      article={article}
      category={category}
      author={author}
      products={products}
      related={related}
    />
  );
}
