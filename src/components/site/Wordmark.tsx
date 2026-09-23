import Link from 'next/link';

/* The wordmark file is the existing logo with its whitespace cropped (viewBox 7280 x 1070). */
const WIDTH = 7280;
const HEIGHT = 1070;

export function Wordmark({ className = 'h-[26px] md:h-[32px]' }: { className?: string }) {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center">
      <img
        src="/brand/morningstacks_wordmark_ink.svg"
        alt="MorningStacks"
        width={WIDTH / 40}
        height={HEIGHT / 40}
        className={`block w-auto ${className}`}
      />
    </Link>
  );
}
