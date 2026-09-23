/** Ratings read as numbers: "4.7 out of 5". Kept as Stars for existing MDX. */
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  const clamped = Math.max(0, Math.min(rating, max));
  return (
    <span className="font-sans font-bold text-[var(--color-ink)] tabular-nums">
      {clamped.toFixed(1)}
      <span className="font-normal text-[var(--color-ink-3)]"> out of {max}</span>
    </span>
  );
}
