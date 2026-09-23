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

/* Reading face. Standfirsts use it above the fold, so the upright style is preloaded. */
export const serif = localFont({
  src: './fonts/source-serif-4-latin.woff2',
  weight: '400 650',
  style: 'normal',
  display: 'swap',
  variable: '--ms-font-serif',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

/* Italics only appear inside body text, so they load on demand. */
export const serifItalic = localFont({
  src: './fonts/source-serif-4-latin-italic.woff2',
  weight: '400',
  style: 'italic',
  display: 'swap',
  preload: false,
  variable: '--ms-font-serif-italic',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
});
