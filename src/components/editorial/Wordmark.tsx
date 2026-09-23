import Link from 'next/link';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'cream';
};

const sizes = {
  sm: 'text-[20px]',
  md: 'text-[28px]',
  lg: 'text-[40px]',
};

export function Wordmark({ size = 'md', tone = 'ink' }: Props) {
  const color = tone === 'cream' ? 'text-[var(--color-cream)]' : 'text-[var(--color-ink)]';
  return (
    <Link
      href="/"
      aria-label="MorningStacks home"
      className={`inline-flex min-h-11 items-center font-serif font-medium leading-none tracking-[-0.03em] ${sizes[size]} ${color}`}
    >
      MorningStacks<span className="text-[var(--color-blue)]">.</span>
    </Link>
  );
}
