import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-grid py-24">
      <p className="text-eyebrow">404</p>
      <h1 className="mt-3 font-serif text-[52px] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[68px]">
        Nothing here<span className="text-[var(--color-blue)]">.</span>
      </h1>
      <p className="mt-6 max-w-[36rem] font-serif text-[20px] italic leading-relaxed text-[var(--color-ink-70)]">
        The URL you followed did not lead anywhere we publish. Probably a typo. Possibly a piece we moved.
      </p>
      <p className="mt-8 flex flex-wrap gap-6 font-sans text-[13px] uppercase tracking-[0.14em]">
        <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">
          Home
        </Link>
        <Link href="/archive/" className="inline-flex min-h-11 items-center underline underline-offset-4">
          Archive
        </Link>
      </p>
    </section>
  );
}
