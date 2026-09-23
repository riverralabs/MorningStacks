export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  const clamped = Math.max(0, Math.min(rating, max));
  const pct = (clamped / max) * 100;
  const label = `${clamped.toFixed(1)} out of ${max}`;
  return (
    <span className="inline-flex items-center gap-2" role="img" aria-label={label}>
      <span className="relative inline-block font-sans text-[16px] leading-none tracking-[2px]">
        <span aria-hidden="true" className="text-[var(--color-ink-15)]">
          ★★★★★
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden text-[var(--color-blue)]"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-sans text-[12px] tabular-nums text-[var(--color-ink-70)]">
        {clamped.toFixed(1)}
      </span>
    </span>
  );
}
