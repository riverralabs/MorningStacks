'use client';

import { useEffect } from 'react';

const BUNDLE = '/_next/static/pagefind/';

export function SearchBox() {
  useEffect(() => {
    let cancelled = false;
    const root = document.getElementById('search');
    if (!root) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${BUNDLE}pagefind-ui.css`;
    document.head.appendChild(link);

    type PagefindUIConstructor = new (_options: Record<string, unknown>) => void;
    import(/* webpackIgnore: true */ `${BUNDLE}pagefind-ui.js`)
      .then((mod: { PagefindUI?: PagefindUIConstructor }) => {
        if (cancelled) return;
        // Pagefind 1.x ships the UI as a classic script that sets window.PagefindUI.
        const PagefindUI =
          mod.PagefindUI ?? (window as unknown as { PagefindUI?: PagefindUIConstructor }).PagefindUI;
        if (!PagefindUI) throw new Error('Pagefind UI did not load');
        new PagefindUI({
          element: '#search',
          bundlePath: BUNDLE,
          showSubResults: true,
          showImages: false,
          resetStyles: false,
          excerptLength: 32,
          translations: { placeholder: 'Try “Cursor pricing” or “Zapier vs Make”' },
        });
        const input = document.querySelector('#search .pagefind-ui__search-input');
        if (!(input instanceof HTMLInputElement)) return;
        input.setAttribute('aria-label', 'Search MorningStacks');
        const q = new URLSearchParams(window.location.search).get('q');
        if (!q) return;
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })
      .catch(() => {
        if (cancelled || !root) return;
        root.textContent = 'The search index is created when the site is built. It is not available in this preview.';
      });

    return () => {
      cancelled = true;
      link.remove();
    };
  }, []);

  return (
    <div id="search" className="min-h-[56px] text-[16px] text-[var(--color-ink-2)]">
      <noscript>Search needs JavaScript. The archive lists every published piece.</noscript>
    </div>
  );
}
