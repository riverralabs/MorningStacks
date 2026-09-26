import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { typeLabel } from '~/lib/content-model';
import {
  formatDate,
  formatShortDate,
  getCategories,
  getReadingTimes,
  type Article,
  type Category,
} from '~/lib/content';

export type StoryContext = {
  categories: Map<string, Category>;
  minutes: Map<string, number>;
};

export function kickerText(article: Article, context: StoryContext, withSection = true): string {
  const section = context.categories.get(article.category)?.name;
  const type = typeLabel(article.type);
  return withSection && section ? `${section} · ${type}` : type;
}

export function StoryMeta({
  article,
  context,
  long = false,
}: {
  article: Article;
  context: StoryContext;
  long?: boolean;
}) {
  const minutes = context.minutes.get(article.slug);
  return (
    <p className="meta">
      <time dateTime={article.date}>
        {long ? formatDate(article.date) : formatShortDate(article.date)}
      </time>
      {minutes ? <span> · {minutes} min read</span> : null}
    </p>
  );
}

/** 1200×630 stock heroes, scaled to the card. Same art as /media/articles/<slug>/hero.png. */
export function CoverThumb({
  article,
  sizes,
  priority = false,
  className = '',
}: {
  article: Article;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!article.hero) return null;
  const alt = article.heroAlt ?? '';
  return (
    <Link
      href={article.href}
      tabIndex={-1}
      aria-hidden={alt ? undefined : true}
      className={`relative block aspect-[1200/630] overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper-2)] ${className}`}
    >
      <Image
        src={article.hero}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </Link>
  );
}

export function LeadStory({
  article,
  context,
  image,
}: {
  article: Article;
  context: StoryContext;
  image?: ReactNode;
}) {
  const cover = image ? (
    <div className="mb-6">{image}</div>
  ) : (
    <CoverThumb
      article={article}
      sizes="(min-width: 1024px) 720px, 100vw"
      priority
      className="mb-6"
    />
  );
  return (
    <article>
      {cover}
      <p className="kicker">{kickerText(article, context)}</p>
      <h2 className="mt-3 text-[length:var(--text-display)] leading-[var(--text-display--line-height)] font-extrabold tracking-[var(--text-display--letter-spacing)]">
        <Link href={article.href} className="headline-link">
          {article.title}
        </Link>
      </h2>
      <p className="mt-5 max-w-[62ch] font-serif text-[length:var(--text-standfirst)] leading-[1.55] text-[var(--color-ink-2)]">
        {article.answer || article.description}
      </p>
      <div className="mt-5">
        <StoryMeta article={article} context={context} long />
      </div>
    </article>
  );
}

export function StoryItem({
  article,
  context,
  size = 'md',
  excerpt = false,
  withSection = true,
  level = 3,
}: {
  article: Article;
  context: StoryContext;
  size?: 'sm' | 'md' | 'lg';
  excerpt?: boolean;
  withSection?: boolean;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  const headline = {
    sm: 'text-[length:var(--text-head-sm)] leading-[var(--text-head-sm--line-height)] tracking-[var(--text-head-sm--letter-spacing)] font-bold',
    md: 'text-[length:var(--text-head-md)] leading-[var(--text-head-md--line-height)] tracking-[var(--text-head-md--letter-spacing)] font-bold',
    lg: 'text-[length:var(--text-head-lg)] leading-[var(--text-head-lg--line-height)] tracking-[var(--text-head-lg--letter-spacing)] font-extrabold',
  }[size];
  const coverSizes =
    size === 'lg'
      ? '(min-width: 1024px) 720px, 100vw'
      : size === 'md'
        ? '(min-width: 768px) 50vw, 100vw'
        : '(min-width: 1024px) 360px, (min-width: 768px) 45vw, 100vw';
  return (
    <article>
      <CoverThumb
        article={article}
        sizes={coverSizes}
        className={size === 'lg' ? 'mb-5' : 'mb-3'}
      />
      <p className="kicker">{kickerText(article, context, withSection)}</p>
      <Heading className={`mt-2 ${headline}`}>
        <Link href={article.href} className="headline-link">
          {article.title}
        </Link>
      </Heading>
      {excerpt ? (
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">
          {article.description}
        </p>
      ) : null}
      <div className="mt-2.5">
        <StoryMeta article={article} context={context} />
      </div>
    </article>
  );
}

/** Dated row for archive and section lists. */
export function StoryRow({ article, context }: { article: Article; context: StoryContext }) {
  const minutes = context.minutes.get(article.slug);
  const cover = article.hero ? (
    <CoverThumb
      article={article}
      sizes="(min-width: 768px) 240px, 100vw"
      className="md:col-span-3"
    />
  ) : null;
  return (
    <article className="grid gap-3 py-6 md:grid-cols-12 md:items-start md:gap-8">
      <p className="meta md:col-span-2 md:pt-1">
        <time dateTime={article.date}>{formatShortDate(article.date)}</time>
      </p>
      {cover}
      <div className={cover ? 'md:col-span-7' : 'md:col-span-10'}>
        <p className="kicker">{kickerText(article, context)}</p>
        <h3 className="mt-2 text-[length:var(--text-head-md)] leading-[var(--text-head-md--line-height)] font-bold tracking-[var(--text-head-md--letter-spacing)]">
          <Link href={article.href} className="headline-link">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">
          {article.description}
        </p>
        {minutes ? <p className="meta mt-2">{minutes} min read</p> : null}
      </div>
    </article>
  );
}

export function ModuleHead({
  title,
  id,
  link,
  level = 2,
}: {
  title: string;
  id?: string;
  link?: { href: string; label: string };
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="module-head">
      <Heading id={id} className="text-[14px] font-extrabold tracking-[0.08em] uppercase">
        {title}
      </Heading>
      {link ? (
        <Link href={link.href} className="link text-[14px] font-semibold">
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-[14px] text-[var(--color-ink-3)]">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-x-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <Link
              href={crumb.href}
              className="inline-flex min-h-11 items-center hover:text-[var(--color-ink)] hover:underline"
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHead({
  crumbs,
  title,
  description,
  meta,
  children,
}: {
  crumbs?: Crumb[];
  title: string;
  description?: string;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--color-rule)]">
      <div className="container-page pt-4 pb-10 md:pb-14">
        {crumbs ? <Breadcrumbs crumbs={crumbs} /> : <div className="h-11" />}
        <h1 className="mt-4 max-w-[22ch] text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-extrabold tracking-[var(--text-title--letter-spacing)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-[60ch] font-serif text-[length:var(--text-standfirst)] leading-[1.55] text-[var(--color-ink-2)]">
            {description}
          </p>
        ) : null}
        {meta ? <p className="meta mt-4">{meta}</p> : null}
        {children}
      </div>
    </header>
  );
}

export async function storyContext(): Promise<StoryContext> {
  const [categories, minutes] = await Promise.all([getCategories(), getReadingTimes()]);
  return { categories: new Map(categories.map((category) => [category.slug, category])), minutes };
}
