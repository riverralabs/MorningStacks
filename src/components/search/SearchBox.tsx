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

    import(/* webpackIgnore: true */ `${BUNDLE}pagefind-ui.js`)
      .then((mod: { PagefindUI: new (_options: Record<string, unknown>) => void }) => {
        if (cancelled) return;
        new mod.PagefindUI({
          element: '#search',
          bundlePath: BUNDLE,
          showSubResults: true,
          showImages: false,
          resetStyles: false,
          excerptLength: 32,
        });
        const q = new URLSearchParams(window.location.search).get('q');
        if (!q) return;
        const input = document.querySelector('#search .pagefind-ui__search-input');
        if (!(input instanceof HTMLInputElement)) return;
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })
      .catch(() => {
        if (cancelled || !root) return;
        root.innerHTML =
          '<p class="font-serif text-[18px] italic text-[var(--color-ink-70)]">Search index will appear after the next build.</p>';
      });

    return () => {
      cancelled = true;
      link.remove();
    };
  }, []);

  return <div id="search" className="mt-10" />;
}
