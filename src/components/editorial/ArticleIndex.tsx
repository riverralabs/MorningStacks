import Link from 'next/link';
import type { Article } from '~/lib/content';
import { formatDate } from '~/lib/content';
import { TypeBadge } from './TypeBadge';

export function ArticleIndex({
  articles,
  showType = true,
}: {
  articles: Article[];
  showType?: boolean;
}) {
  if (articles.length === 0) {
    return (
      <p className="font-serif text-[18px] italic text-[var(--color-ink-70)]">
        Nothing published in this section yet.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-[var(--color-ink-10)] border-y border-[var(--color-ink-10)]">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link href={article.href} className="group grid gap-2 py-6 sm:grid-cols-[9rem_1fr] sm:gap-8">
            <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink-55)]">
              {formatDate(article.date)}
            </p>
            <div>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {showType ? <TypeBadge type={article.type} /> : null}
                {showType ? <span aria-hidden="true" className="text-[var(--color-ink-25)]">·</span> : null}
                <span className="text-eyebrow">{article.eyebrow}</span>
              </p>
              <h3 className="mt-2 font-serif text-[26px] font-medium leading-[1.15] tracking-[-0.02em] group-hover:text-[var(--color-blue)]">
                {article.title}
              </h3>
              <p className="mt-2 max-w-[62ch] font-serif text-[17px] leading-relaxed text-[var(--color-ink-70)]">
                {article.answer || article.description}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
