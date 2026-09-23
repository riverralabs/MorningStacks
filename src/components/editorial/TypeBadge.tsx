import { typeLabel, type ArticleType } from '~/lib/content-model';

export function TypeBadge({ type }: { type: ArticleType }) {
  return (
    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-blue)]">
      {typeLabel(type)}
    </span>
  );
}
