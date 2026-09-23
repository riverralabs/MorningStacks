import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { goHref, isActiveProgram } from '~/lib/affiliate';
import type { Product } from '~/lib/content';
import { formatDate } from '~/lib/content';
import { mediaSize } from '~/lib/media';
import { createSlugger, textOf } from '~/lib/reading';
import { Stars } from '~/components/editorial/Stars';

type Tone = 'info' | 'good' | 'warn' | 'bad';

const toneStyles: Record<Tone, string> = {
  info: 'bg-[var(--color-navy-tint)]',
  good: 'bg-[var(--color-good-tint)]',
  warn: 'bg-[var(--color-paper-2)]',
  bad: 'bg-[var(--color-bad-tint)]',
};

export function Callout({ tone = 'info', title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <aside className={`not-prose my-8 px-5 py-5 md:px-6 ${toneStyles[tone] ?? toneStyles.info}`}>
      {title ? <p className="mb-2 font-sans text-[16px] font-bold text-[var(--color-ink)]">{title}</p> : null}
      <div className="font-sans text-[16px] leading-relaxed text-[var(--color-ink)] [&_a]:text-[var(--color-navy)] [&_a]:underline [&_p+p]:mt-3">
        {children}
      </div>
    </aside>
  );
}

export function PullQuote({ cite, children }: { cite?: string; children?: ReactNode }) {
  return (
    <figure className="not-prose my-10 border-t-2 border-b border-t-[var(--color-ink)] border-b-[var(--color-rule)] py-6">
      <blockquote className="m-0 font-sans text-[clamp(1.375rem,1.2rem+0.8vw,1.75rem)] leading-[1.25] font-bold tracking-[-0.02em] text-[var(--color-ink)]">
        {children}
      </blockquote>
      {cite ? <figcaption className="mt-3 font-sans text-[14px] text-[var(--color-ink-3)]">{cite}</figcaption> : null}
    </figure>
  );
}

function PlusMinusList({ items, sign }: { items: string[]; sign: '+' | '−' }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[1.25rem_1fr] gap-1 font-sans text-[16px] leading-relaxed text-[var(--color-ink)]">
          <span
            aria-hidden="true"
            className={`font-bold ${sign === '+' ? 'text-[var(--color-good)]' : 'text-[var(--color-bad)]'}`}
          >
            {sign}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProsCons({ title, pros = [], cons = [] }: { title?: string; pros?: string[]; cons?: string[] }) {
  return (
    <section className="not-prose my-10 border-t-2 border-[var(--color-ink)]">
      {title ? (
        <h3 className="pt-4 font-sans text-[18px] font-extrabold tracking-[-0.01em] text-[var(--color-ink)]">{title}</h3>
      ) : null}
      <div className="grid gap-6 pt-4 sm:grid-cols-2 sm:gap-10">
        <div>
          <p className="font-sans text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-good)] uppercase">
            What works
          </p>
          <PlusMinusList items={pros} sign="+" />
        </div>
        <div className="border-t border-[var(--color-rule)] pt-6 sm:border-t-0 sm:pt-0">
          <p className="font-sans text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-bad)] uppercase">
            What doesn’t
          </p>
          <PlusMinusList items={cons} sign="−" />
        </div>
      </div>
    </section>
  );
}

export function Verdict({ label = 'Verdict', children }: { label?: string; children?: ReactNode }) {
  return (
    <div className="not-prose my-8 border border-[var(--color-ink)] bg-[var(--color-white)] px-5 py-5 md:px-6">
      <p className="font-sans text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-navy)] uppercase">{label}</p>
      <div className="mt-2 font-serif text-[18px] leading-relaxed text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

export function DisclosureNote({ variant = 'banner' }: { variant?: 'banner' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <p className="font-sans text-[13px] text-[var(--color-ink-3)]">
        Affiliate links may apply.{' '}
        <Link className="underline underline-offset-2" href="/disclosure/">
          Disclosure
        </Link>
      </p>
    );
  }
  return (
    <p className="not-prose font-sans text-[14px] leading-relaxed text-[var(--color-ink-2)]">
      <strong className="font-bold text-[var(--color-ink)]">Disclosure.</strong> We earn a commission if you buy
      through some links on this page. It never changes the score, the verdict, or what we cover.{' '}
      <Link className="link font-semibold" href="/disclosure/">
        How this works
      </Link>
    </p>
  );
}

export function ComparisonTable({ children }: { children?: ReactNode }) {
  return <div className="table-wrap">{children}</div>;
}

export function Figure({ src, alt, caption }: { src: string | { src?: string }; alt: string; caption?: string }) {
  const url = typeof src === 'string' ? src : src?.src;
  if (!url) return null;
  const size = mediaSize(url);
  const showCaption = Boolean(caption && caption.trim() !== alt.trim());
  return (
    <figure className="not-prose my-8">
      <img
        src={url}
        alt={alt}
        width={size?.width}
        height={size?.height}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full border border-[var(--color-rule)]"
      />
      {showCaption ? (
        <figcaption className="mt-2 font-sans text-[14px] leading-snug text-[var(--color-ink-3)]">{caption}</figcaption>
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
    <aside
      aria-label={`${product.name} at a glance`}
      className="not-prose my-10 border border-[var(--color-ink)] bg-[var(--color-white)] font-sans"
    >
      <div className="grid gap-4 border-b border-[var(--color-rule)] p-5 sm:grid-cols-[1fr_auto] md:p-6">
        <div>
          <p className="kicker">{product.vendor}</p>
          <h3 className="mt-1.5 text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] text-[var(--color-ink)]">
            {product.name}
          </h3>
          <p className="mt-2 max-w-[48ch] text-[16px] leading-relaxed text-[var(--color-ink-2)]">{product.summary}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 self-start text-[14px] sm:grid-cols-1 sm:text-right">
          {product.price ? (
            <div>
              <dt className="text-[var(--color-ink-3)]">Price</dt>
              <dd className="font-bold text-[var(--color-ink)]">{product.price}</dd>
            </div>
          ) : null}
          {product.rating > 0 ? (
            <div>
              <dt className="text-[var(--color-ink-3)]">Our rating</dt>
              <dd>
                <Stars rating={product.rating} />
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
      {product.pros.length > 0 || product.cons.length > 0 ? (
        <div className="grid gap-6 border-b border-[var(--color-rule)] p-5 sm:grid-cols-2 sm:gap-10 md:p-6">
          <div>
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-good)] uppercase">What works</p>
            <PlusMinusList items={product.pros} sign="+" />
          </div>
          <div>
            <p className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-bad)] uppercase">What doesn’t</p>
            <PlusMinusList items={product.cons} sign="−" />
          </div>
        </div>
      ) : null}
      <div className="p-5 md:p-6">
        {product.ourVerdict ? (
          <p className="font-serif text-[18px] leading-relaxed text-[var(--color-ink)]">
            <strong className="font-sans text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-navy)] uppercase">
              Verdict{' '}
            </strong>
            {product.ourVerdict}
          </p>
        ) : null}
        {href ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={href}
              {...(paid ? { rel: 'sponsored noopener', target: '_blank' } : { rel: 'noopener' })}
              className="btn btn-primary"
            >
              {paid ? `Try ${product.name}` : `Visit ${product.name}`}
            </a>
            <p className="meta">
              {host}
              {product.lastTested ? ` · last tested ${formatDate(product.lastTested)}` : ''}
              {paid ? ' · affiliate link' : ''}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export function AffiliateLinkView({ product, children }: { product: Product; children?: ReactNode }) {
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

function MdxImage({ alt, ...props }: ComponentPropsWithoutRef<'img'>) {
  const size = typeof props.src === 'string' ? mediaSize(props.src) : null;
  return (
    <img
      {...props}
      alt={alt ?? ''}
      width={props.width ?? size?.width}
      height={props.height ?? size?.height}
      loading="lazy"
      decoding="async"
    />
  );
}

export function createMdxComponents(products: Product[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const slug = createSlugger();
  return {
    h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
      <h2 {...props} id={props.id ?? slug(textOf(children))}>
        {children}
      </h2>
    ),
    img: MdxImage,
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
