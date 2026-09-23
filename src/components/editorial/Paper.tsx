import type { ReactNode } from 'react';

export function Paper({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="container-article py-14 sm:py-16">
      <p className="text-eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-[16ch] font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.03em] text-[var(--color-ink)] sm:text-[52px]">
        {title}
      </h1>
      <div className="prose-ms mt-8">{children}</div>
    </article>
  );
}
