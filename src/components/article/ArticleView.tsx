import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import {
  Callout,
  DisclosureNote,
  ProductCardView,
  ProsCons,
  Verdict,
  createMdxComponents,
} from '~/components/mdx/blocks';
import { Newsletter } from '~/components/editorial/Newsletter';
import { Stars } from '~/components/editorial/Stars';
import { TypeBadge } from '~/components/editorial/TypeBadge';
import { shouldShowDisclosure, typeLabel } from '~/lib/content-model';
import {
  formatDate,
  type Article,
  type Author,
  type Category,
  type Product,
} from '~/lib/content';
import { prepareMdx } from '~/lib/mdx-source';
import { canonical, ogImage } from '~/lib/seo';
import { articleSchema, breadcrumbSchema, faqSchema, reviewSchema } from '~/lib/schema';
import { JsonLd } from '~/components/editorial/JsonLd';

export function articleOgPath(article: Article): string {
  return `${article.category}/${article.slug}`;
}

export function ArticleJsonLd({
  article,
  category,
  author,
  product,
}: {
  article: Article;
  category: Category;
  author: Author;
  product?: Product;
}) {
  const url = canonical(article.href);
  const image = ogImage(articleOgPath(article));
  const published = new Date(`${article.date.slice(0, 10)}T00:00:00Z`);
  const modified = article.updated
    ? new Date(`${article.updated.slice(0, 10)}T00:00:00Z`)
    : undefined;
  const nodes: object[] = [
    article.type === 'review' && product
      ? reviewSchema({
          url,
          title: article.title,
          description: article.description,
          datePublished: published,
          dateModified: modified,
          image,
          productName: product.name,
          productCategory: category.name,
          rating: article.rating ?? product.rating,
          authorName: author.name,
        })
      : articleSchema({
          url,
          title: article.title,
          description: article.description,
          datePublished: published,
          dateModified: modified,
          image,
          section: category.name,
          authorName: author.name,
        }),
    breadcrumbSchema([
      { name: 'Home', url: canonical('/') },
      { name: category.name, url: canonical(category.href) },
      { name: article.title, url },
    ]),
  ];
  const faq = faqSchema(article.faq);
  if (faq) nodes.push(faq);
  return <JsonLd data={nodes} />;
}

export async function ArticleView({
  article,
  category,
  author,
  products,
  catalog = products,
  related,
}: {
  article: Article;
  category: Category;
  author: Author;
  products: Product[];
  catalog?: Product[];
  related: Article[];
}) {
  const raw = await article.readBody();
  const source = prepareMdx(raw, article.slug);
  const reviewed = article.type === 'review' ? products[0] : undefined;
  const showDisclosure = shouldShowDisclosure({ products: article.products, body: raw });
  const bodyHasProductCard = /<ProductCard\b/.test(raw);
  const bodyHasProsCons = /<ProsCons\b/.test(raw);
  const bodyHasVerdict = /<Verdict\b/.test(raw);
  const showLayoutProductCards = article.type === 'review' && products.length > 0 && !bodyHasProductCard;
  const showLayoutProsCons = article.type === 'review' && products[0] && !bodyHasProsCons;
  const showLayoutVerdict =
    article.type === 'review' && (article.rating || products[0]) && !bodyHasVerdict;
  const lastTested = article.lastTested ?? products[0]?.lastTested;
  const ourPick = article.ourPick ?? products[0]?.ourVerdict;
  const rating = article.rating ?? reviewed?.rating;

  return (
    <article className="pb-8 pt-8 sm:pt-10" data-pagefind-body>
      <ArticleJsonLd article={article} category={category} author={author} product={reviewed} />
      <div className="container-article">
        <nav aria-label="Breadcrumb" className="font-sans text-[12px] uppercase tracking-[0.12em] text-[var(--color-ink-55)]">
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-[var(--color-blue)]">
            Home
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href={category.href} className="inline-flex min-h-11 items-center hover:text-[var(--color-blue)]">
            {category.name}
          </Link>
        </nav>
        <header className="mt-2 border-b border-[var(--color-ink)] pb-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <TypeBadge type={article.type} />
            <span aria-hidden="true" className="text-[var(--color-ink-25)]">
              ·
            </span>
            <span className="text-eyebrow">{article.eyebrow}</span>
          </p>
          <h1 className="mt-3 font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--color-ink)] sm:text-[48px]">
            {article.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[13px] text-[var(--color-ink-55)]">
            <span>{author.byline}</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            {article.updated ? (
              <span>
                Updated <time dateTime={article.updated}>{formatDate(article.updated)}</time>
              </span>
            ) : null}
            {article.type === 'review' && rating ? <Stars rating={rating} /> : null}
          </p>
          {article.answer ? (
            <p className="mt-6 font-serif text-[19px] leading-[1.55] text-[var(--color-ink)]">{article.answer}</p>
          ) : null}
          {article.type === 'review' && (lastTested || article.testMethod) ? (
            <p className="mt-4 font-sans text-[13px] text-[var(--color-ink-55)]">
              {lastTested ? (
                <span>
                  Last tested <time dateTime={lastTested}>{formatDate(lastTested)}</time>
                </span>
              ) : null}
              {lastTested && article.testMethod ? <span aria-hidden="true"> · </span> : null}
              {article.testMethod ? <span>{article.testMethod}</span> : null}
            </p>
          ) : null}
        </header>
        {article.hero ? (
          <figure className="mt-8">
            <img src={article.hero} alt={article.heroAlt ?? article.title} className="h-auto w-full" />
          </figure>
        ) : null}
      </div>

      <div className="container-article mt-10">
        {showDisclosure ? <DisclosureNote /> : null}
        {article.type === 'briefing' ? (
          <Callout title="Not a product test">
            This is a sourced {typeLabel(article.type).toLowerCase()}, not a lived-with review.
          </Callout>
        ) : null}
        {article.type === 'roundup' && ourPick ? (
          <aside className="not-prose mb-8 border-l-[3px] border-[var(--color-blue)] px-5 py-4">
            <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
              Our pick
            </p>
            <p className="mt-2 font-serif text-[17px] leading-relaxed text-[var(--color-ink)]">{ourPick}</p>
          </aside>
        ) : null}
        {showLayoutProductCards
          ? products.map((product) => <ProductCardView key={product.slug} product={product} />)
          : null}
        {showLayoutProsCons && products[0] ? (
          <ProsCons title={products[0].name} pros={products[0].pros} cons={products[0].cons} />
        ) : null}
        {showLayoutVerdict ? (
          <Verdict>{products[0]?.ourVerdict ?? `Rated ${article.rating} of 5.`}</Verdict>
        ) : null}
        <div className="prose-ms">
          <MDXRemote
            source={source}
            components={createMdxComponents(catalog)}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
        {article.faq.length > 0 ? (
          <section className="not-prose mt-16 border-t border-[var(--color-ink)] pt-8">
            <h2 className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.02em]">
              Frequently asked
            </h2>
            <dl className="mt-6 space-y-6">
              {article.faq.map((entry) => (
                <div key={entry.q}>
                  <dt className="font-serif text-[18px] text-[var(--color-ink)]">{entry.q}</dt>
                  <dd className="mt-2 font-serif text-[17px] leading-[1.7] text-[var(--color-ink-85)]">
                    {entry.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        {article.sources.length > 0 ? (
          <section className="not-prose mt-16 border-t border-[var(--color-ink)] pt-8">
            <h2 className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.02em]">Sources</h2>
            <ul className="mt-6 space-y-3 font-serif text-[17px] leading-[1.7] text-[var(--color-ink-85)]">
              {article.sources.map((sourceItem) => (
                <li key={`${sourceItem.title}-${sourceItem.checked}`}>
                  {sourceItem.url ? (
                    <a href={sourceItem.url} className="underline underline-offset-2">
                      {sourceItem.title}
                    </a>
                  ) : (
                    sourceItem.title
                  )}
                  <span className="font-sans text-[13px] text-[var(--color-ink-55)]">
                    {' '}
                    Checked {formatDate(sourceItem.checked)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="container-article mt-16">
        <Newsletter source={`article-${article.slug}`} />
      </div>

      {related.length > 0 ? (
        <section className="container-article mt-16 border-t border-[var(--color-ink-15)] pt-8">
          <h2 className="text-eyebrow">Read next</h2>
          <ul className="mt-4 divide-y divide-[var(--color-ink-10)]">
            {related.slice(0, 3).map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="group block py-4">
                  <p className="text-eyebrow">{item.eyebrow}</p>
                  <p className="mt-1 font-serif text-[22px] leading-snug group-hover:text-[var(--color-blue)]">
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
