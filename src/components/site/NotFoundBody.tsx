import Link from 'next/link';

export function NotFoundBody() {
  return (
    <section className="container-page section-y">
      <div className="max-w-[40rem]">
        <p className="meta">Error 404</p>
        <h1 className="mt-3 text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-extrabold tracking-[var(--text-title--letter-spacing)]">
          This page isn’t here.
        </h1>
        <p className="mt-5 font-serif text-[length:var(--text-standfirst)] leading-[1.55] text-[var(--color-ink-2)]">
          The link may be old or mistyped, or the piece may have moved. Everything we have published is in the
          archive.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/archive/" className="btn btn-primary">
            Browse the archive
          </Link>
          <Link href="/" className="link text-[15px] font-semibold">
            Front page
          </Link>
          <Link href="/search/" className="link text-[15px] font-semibold">
            Search
          </Link>
        </div>
      </div>
    </section>
  );
}
