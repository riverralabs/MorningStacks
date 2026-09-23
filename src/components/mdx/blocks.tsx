import Link from 'next/link';
import type { ReactNode } from 'react';
import { goHref, isActiveProgram } from '~/lib/affiliate';
import type { Product } from '~/lib/content';
import { formatDate } from '~/lib/content';
import { Stars } from '~/components/editorial/Stars';

type Tone = 'info' | 'good' | 'warn' | 'bad';

export function Callout({
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <aside className="not-prose my-8 border-l-[3px] border-[var(--color-blue)] bg-[var(--color-cream)] px-5 py-4">
      {title ? (
        <p className="mb-2 font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--color-blue)]">
          {title}
        </p>
      ) : null}
      <div className="font-serif text-[16px] leading-relaxed text-[var(--color-ink-85)]">{children}</div>
    </aside>
  );
}

export function PullQuote({ cite, children }: { cite?: string; children?: ReactNode }) {
  return (
    <figure className="not-prose my-12 border-l-[3px] border-[var(--color-blue)] py-2 pl-6 sm:pl-8">
      <blockquote className="m-0 font-serif text-[24px] font-normal italic leading-snug text-[var(--color-ink)]">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="mt-3 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-ink-55)]">
          {cite}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ProsCons({
  title,
  pros = [],
  cons = [],
}: {
  title?: string;
  pros?: string[];
  cons?: string[];
}) {
  return (
    <section className="not-prose my-10 border border-[var(--color-ink-10)]">
      {title ? (
        <header className="border-b border-[var(--color-ink-10)] px-6 py-4">
          <h3 className="font-serif text-[22px] font-medium tracking-[-0.02em] text-[var(--color-ink)]">
            {title}
          </h3>
        </header>
      ) : null}
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="p-6 sm:border-r sm:border-[var(--color-ink-10)]">
          <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
            Pros
          </p>
          <ul className="mt-3 space-y-2 font-serif text-[16px] leading-relaxed text-[var(--color-ink-85)]">
            {pros.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--color-ink-40)]">
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-[var(--color-ink-10)] p-6 sm:border-t-0">
          <p className="font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
            Cons
          </p>
          <ul className="mt-3 space-y-2 font-serif text-[16px] leading-relaxed text-[var(--color-ink-85)]">
            {cons.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--color-ink-40)]">
                  –
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Verdict({ label = 'Verdict', children }: { label?: string; children?: ReactNode }) {
  return (
    <p className="not-prose my-6 border-l-[3px] border-[var(--color-ink)] py-1 pl-4 font-serif text-[18px] leading-relaxed text-[var(--color-ink)]">
      <span className="mr-2 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--color-blue)]">
        {label}
      </span>
      {children}
    </p>
  );
}

export function DisclosureNote({ variant = 'banner' }: { variant?: 'banner' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <p className="font-sans text-[12px] text-[var(--color-ink-55)]">
        Affiliate links may apply.{' '}
        <Link className="text-[var(--color-blue)] underline underline-offset-2" href="/disclosure/">
          Disclosure
        </Link>
        .
      </p>
    );
  }
  return (
    <aside className="not-prose mb-8 border-l-[3px] border-[var(--color-blue)] px-5 py-4 font-serif text-[15px] italic leading-relaxed text-[var(--color-ink-70)]">
      <p className="m-0">
        <strong className="font-sans text-[12px] font-medium uppercase not-italic tracking-[0.14em] text-[var(--color-blue)]">
          Disclosure ·{' '}
        </strong>
        We earn a commission if you buy through some links on this page. It never changes the score, the
        verdict, or who gets reviewed.{' '}
        <Link
          className="font-sans text-[var(--color-blue)] underline not-italic underline-offset-2"
          href="/disclosure/"
        >
          How this works.
        </Link>
      </p>
    </aside>
  );
}

export function ComparisonTable({ children }: { children?: ReactNode }) {
  return <div className="table-wrap">{children}</div>;
}

export function Figure({
  src,
  alt,
  caption,
}: {
  src: string | { src?: string };
  alt: string;
  caption?: string;
}) {
  const url = typeof src === 'string' ? src : src?.src;
  if (!url) return null;
  const showCaption = Boolean(caption && caption.trim() !== alt.trim());
  return (
    <figure className="not-prose my-8">
      {/* Article figures are already sized for the 720px measure. */}
      <img src={url} alt={alt} className="h-auto w-full" />
      {showCaption ? (
        <figcaption className="mt-3 font-sans text-[12px] leading-snug text-[var(--color-ink-55)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function publicHost(product: Product): string {
  const raw = product.websiteUrl || product.affiliateUrl;
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function ProductCardView({ product }: { product: Product }) {
  const paid = isActiveProgram(product);
  const href = paid ? goHref(product.slug) : product.websiteUrl || product.affiliateUrl;
  const host = publicHost(product);
  return (
    <article className="not-prose my-10 border border-[var(--color-ink)]">
      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="text-eyebrow">{product.vendor}</p>
          <h3 className="mt-2 font-serif text-[28px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
            {product.name}
          </h3>
          <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-[var(--color-ink-70)]">
            {product.summary}
          </p>
          <div className="mt-5 flex items-center gap-4">
            {product.rating > 0 ? <Stars rating={product.rating} /> : null}
            <span className="font-sans text-[12px] text-[var(--color-ink-55)]">{product.price}</span>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-eyebrow">What works</p>
              <ul className="mt-2 space-y-1 font-serif text-[15px] leading-relaxed text-[var(--color-ink-85)]">
                {product.pros.map((pro) => (
                  <li key={pro}>· {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-eyebrow">What doesn&apos;t</p>
              <ul className="mt-2 space-y-1 font-serif text-[15px] leading-relaxed text-[var(--color-ink-85)]">
                {product.cons.map((con) => (
                  <li key={con}>· {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <aside className="flex flex-col justify-between gap-6 border-t border-[var(--color-ink-15)] p-6 sm:p-8 md:border-t-0 md:border-l">
          <div>
            <p className="text-eyebrow">Our verdict</p>
            <p className="mt-3 font-serif text-[16px] leading-relaxed text-[var(--color-ink-85)]">
              {product.ourVerdict}
            </p>
          </div>
          <div>
            <a
              href={href}
              {...(paid ? { rel: 'sponsored noopener', target: '_blank' } : { rel: 'noopener' })}
              className="inline-flex min-h-11 w-full items-center justify-center border border-[var(--color-ink)] px-4 font-sans text-[13px] uppercase tracking-[0.14em] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
            >
              {paid ? `Try ${product.name}` : `Visit ${product.name}`}
            </a>
            <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.12em] text-[var(--color-ink-55)]">
              {host}
              {product.lastTested ? ` · last tested ${formatDate(product.lastTested)}` : ''}
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}

export function AffiliateLinkView({
  product,
  children,
}: {
  product: Product;
  children?: ReactNode;
}) {
  if (!isActiveProgram(product)) {
    const href = product.websiteUrl || product.affiliateUrl;
    if (!href) return <>{children}</>;
    return (
      <a href={href} rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <a href={goHref(product.slug)} rel="sponsored noopener" target="_blank">
      {children}
    </a>
  );
}

export function createMdxComponents(products: Product[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return {
    Callout,
    PullQuote,
    ProsCons,
    Verdict,
    Disclosure: () => <DisclosureNote />,
    ComparisonTable,
    Figure,
    Stars,
    ProductCard: ({ product }: { product: string }) => {
      const item = bySlug.get(product);
      if (!item) return null;
      return <ProductCardView product={item} />;
    },
    AffiliateLink: ({ product, children }: { product: string; children?: ReactNode }) => {
      const item = bySlug.get(product);
      if (!item) return <>{children}</>;
      return <AffiliateLinkView product={item}>{children}</AffiliateLinkView>;
    },
  };
}
