import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import {
  DisclosureNote,
  ProductCardView,
  ProsCons,
  Verdict,
  createMdxComponents,
} from '~/components/mdx/blocks';
import { JsonLd } from '~/components/editorial/JsonLd';
import { Stars } from '~/components/editorial/Stars';
import { NewsletterBand } from '~/components/newsletter/Newsletter';
import { Breadcrumbs, ModuleHead, StoryItem, storyContext } from '~/components/stories/Story';
import { shouldShowDisclosure, typeLabel } from '~/lib/content-model';
import { formatDate, type Article, type Author, type Category, type Product } from '~/lib/content';
import { mediaSize } from '~/lib/media';
import { prepareMdx } from '~/lib/mdx-source';
import { headingsFrom, readingMinutes, type Heading } from '~/lib/reading';
import { canonical, ogImage } from '~/lib/seo';
import { articleSchema, breadcrumbSchema, faqSchema, reviewSchema } from '~/lib/schema';

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
  const modified = article.updated ? new Date(`${article.updated.slice(0, 10)}T00:00:00Z`) : undefined;
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

function Contents({ headings }: { headings: Heading[] }) {
  return (
    <ol className="mt-3 space-y-1">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className="block py-1.5 text-[15px] leading-snug text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:underline hover:underline-offset-4"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function hostOf(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function latestChecked(article: Article): string | null {
  const dates = article.sources.map((source) => source.checked).filter(Boolean).sort();
  return dates.at(-1) ?? null;
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
  const [raw, context] = await Promise.all([article.readBody(), storyContext()]);
  const source = prepareMdx(raw, article.slug);
  const headings = headingsFrom(raw);
  const minutes = readingMinutes(raw);
  const reviewed = article.type === 'review' ? products[0] : undefined;
  const showDisclosure = shouldShowDisclosure({ products: article.products, body: raw });
  const bodyHasProductCard = /<ProductCard\b/.test(raw);
  const bodyHasProsCons = /<ProsCons\b/.test(raw);
  const bodyHasVerdict = /<Verdict\b/.test(raw);
  const showLayoutProductCards = article.type === 'review' && products.length > 0 && !bodyHasProductCard;
  const showLayoutProsCons = article.type === 'review' && products[0] && !bodyHasProsCons;
  const showLayoutVerdict = article.type === 'review' && (article.rating || products[0]) && !bodyHasVerdict;
  const lastTested = article.lastTested ?? products[0]?.lastTested;
  const ourPick = article.ourPick ?? products[0]?.ourVerdict;
  const rating = article.rating ?? reviewed?.rating;
  const checked = latestChecked(article);
  const hero = article.hero ? mediaSize(article.hero) : null;
  const notSourcedTest = article.type !== 'review';

  return (
    <>
      <article data-pagefind-body>
        <ArticleJsonLd article={article} category={category} author={author} product={reviewed} />
        <div className="container-page pt-4">
          <Breadcrumbs
            crumbs={[
              { href: '/', label: 'Front page' },
              { href: category.href, label: category.name },
            ]}
          />
          <header className="mt-4 border-b border-[var(--color-rule)] pb-8 md:pb-10">
            <div className="max-w-[52rem]">
              <p className="kicker">{article.eyebrow || typeLabel(article.type)}</p>
              <h1 className="mt-3 text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-extrabold tracking-[var(--text-title--letter-spacing)]">
                {article.title}
              </h1>
              <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[var(--color-ink-2)]">
                <span className="font-semibold text-[var(--color-ink)]">By {author.name}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Published <time dateTime={article.date}>{formatDate(article.date)}</time>
                </span>
                {article.updated ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      Updated <time dateTime={article.updated}>{formatDate(article.updated)}</time>
                    </span>
                  </>
                ) : null}
                <span aria-hidden="true">·</span>
                <span>{minutes} min read</span>
              </p>
              {article.type === 'review' && (rating || lastTested || article.testMethod) ? (
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[var(--color-ink-2)]">
                  {rating ? <Stars rating={rating} /> : null}
                  {lastTested ? (
                    <span>
                      {rating ? '· ' : ''}Last tested <time dateTime={lastTested}>{formatDate(lastTested)}</time>
                    </span>
                  ) : null}
                  {article.testMethod ? <span>· {article.testMethod}</span> : null}
                </p>
              ) : null}
            </div>
          </header>
        </div>

        <div className="container-page grid gap-10 pt-8 pb-16 md:pt-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="max-w-[var(--container-prose)]">
              {article.hero ? (
                <figure className="mb-8">
                  <img
                    src={article.hero}
                    alt={article.heroAlt ?? ''}
                    width={hero?.width}
                    height={hero?.height}
                    fetchPriority="high"
                    className="block h-auto w-full border border-[var(--color-rule)]"
                  />
                </figure>
              ) : null}

              {article.answer ? (
                <section aria-labelledby="short-answer" className="border-2 border-[var(--color-ink)] bg-[var(--color-white)] p-5 md:p-6">
                  <h2 id="short-answer" className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-navy)] uppercase">
                    The short answer
                  </h2>
                  <p className="mt-2 font-serif text-[19px] leading-[1.6] text-[var(--color-ink)]">{article.answer}</p>
                </section>
              ) : null}

              {showDisclosure || notSourcedTest ? (
                <div className="mt-6 space-y-2 border-b border-[var(--color-rule)] pb-6">
                  {notSourcedTest ? (
                    <p className="text-[14px] leading-relaxed text-[var(--color-ink-2)]">
                      <strong className="font-bold text-[var(--color-ink)]">About this piece.</strong> This is a
                      sourced {typeLabel(article.type).toLowerCase()}. It is based on the sources listed at the end,
                      not on a hands-on product test.{' '}
                      <Link href="/methodology/" className="link font-semibold">
                        How we work
                      </Link>
                    </p>
                  ) : null}
                  {showDisclosure ? <DisclosureNote /> : null}
                </div>
              ) : null}

              {headings.length > 2 ? (
                <details className="group mt-6 border-y border-[var(--color-rule)] lg:hidden">
                  <summary className="flex min-h-12 items-center justify-between text-[15px] font-bold">
                    In this piece
                    <span aria-hidden="true" className="text-[20px] leading-none font-normal group-open:hidden">
                      +
                    </span>
                    <span aria-hidden="true" className="hidden text-[20px] leading-none font-normal group-open:inline">
                      −
                    </span>
                  </summary>
                  <div className="pb-4">
                    <Contents headings={headings} />
                  </div>
                </details>
              ) : null}

              <div className="mt-8">
                {article.type === 'roundup' && ourPick ? (
                  <Verdict label="Our pick">{ourPick}</Verdict>
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
              </div>

              {article.faq.length > 0 ? (
                <section aria-labelledby="faq" className="mt-14">
                  <h2 id="faq" className="border-t-2 border-[var(--color-ink)] pt-4 text-[24px] font-extrabold tracking-[-0.02em]">
                    Questions readers ask
                  </h2>
                  <div className="mt-2">
                    {article.faq.map((entry) => (
                      <details key={entry.q} className="group border-b border-[var(--color-rule)]">
                        <summary className="flex min-h-12 items-start justify-between gap-4 py-4 text-[17px] leading-snug font-bold">
                          <span>{entry.q}</span>
                          <span aria-hidden="true" className="text-[22px] leading-none font-normal group-open:hidden">
                            +
                          </span>
                          <span aria-hidden="true" className="hidden text-[22px] leading-none font-normal group-open:inline">
                            −
                          </span>
                        </summary>
                        <p className="pb-5 font-serif text-[18px] leading-[1.65] text-[var(--color-ink)]">{entry.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}

              {article.sources.length > 0 ? (
                <section aria-labelledby="sources" className="mt-14">
                  <h2 id="sources" className="border-t-2 border-[var(--color-ink)] pt-4 text-[24px] font-extrabold tracking-[-0.02em]">
                    Sources
                  </h2>
                  <ol className="mt-4 space-y-4">
                    {article.sources.map((item, index) => (
                      <li key={`${item.title}-${item.checked}`} className="grid grid-cols-[2rem_1fr] text-[16px] leading-relaxed">
                        <span className="font-bold text-[var(--color-ink-3)] tabular-nums">{index + 1}.</span>
                        <span>
                          {item.url ? (
                            <a href={item.url} className="link" rel="noopener">
                              {item.title}
                            </a>
                          ) : (
                            item.title
                          )}
                          <span className="meta block">
                            {hostOf(item.url) ? `${hostOf(item.url)} · ` : ''}checked {formatDate(item.checked)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              <section aria-label="About the author" className="mt-14 border-t border-[var(--color-rule)] pt-6">
                <p className="text-[15px] font-bold">{author.name}</p>
                {author.role ? <p className="text-[14px] text-[var(--color-ink-3)]">{author.role}</p> : null}
                {author.bio ? (
                  <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">{author.bio}</p>
                ) : null}
              </section>
            </div>
          </div>

          <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block" aria-label="In this piece">
            <div className="sticky top-6 space-y-8">
              {headings.length > 0 ? (
                <nav aria-label="Contents">
                  <p className="border-t-[3px] border-[var(--color-ink)] pt-3 text-[13px] font-extrabold tracking-[0.08em] uppercase">
                    In this piece
                  </p>
                  <Contents headings={headings} />
                </nav>
              ) : null}
              {article.sources.length > 0 ? (
                <div className="border-t border-[var(--color-rule)] pt-4 text-[14px] leading-relaxed text-[var(--color-ink-2)]">
                  <p>
                    <a href="#sources" className="link font-semibold">
                      {article.sources.length} {article.sources.length === 1 ? 'source' : 'sources'}
                    </a>
                    {checked ? `, last checked ${formatDate(checked)}.` : '.'}
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="read-next" className="border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="container-page section-y">
            <ModuleHead id="read-next" title="Read next" link={{ href: category.href, label: `More in ${category.name}` }} />
            <ul className="mt-6 grid gap-8 md:grid-cols-3 md:gap-10">
              {related.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <StoryItem article={item} context={context} size="md" excerpt />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <NewsletterBand source={`article-${article.slug}`} />
    </>
  );
}
