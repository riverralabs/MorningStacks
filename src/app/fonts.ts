import localFont from 'next/font/local';

export const sans = localFont({
  src: './fonts/schibsted-grotesk-latin.woff2',
  weight: '400 900',
  style: 'normal',
  display: 'swap',
  variable: '--ms-font-sans',
  fallback: ['Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

/* Reading face. Not preloaded because only article bodies and page prose use it. */
export const serif = localFont({
  src: [
    { path: './fonts/source-serif-4-latin.woff2', weight: '200 900', style: 'normal' },
    { path: './fonts/source-serif-4-latin-italic.woff2', weight: '200 900', style: 'italic' },
  ],
  display: 'swap',
  preload: false,
  variable: '--ms-font-serif',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
});
