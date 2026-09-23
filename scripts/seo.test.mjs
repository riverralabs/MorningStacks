import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalUrl } from '../src/lib/site-url.ts';
import {
  articleLastmodByUrl,
  articlePath,
  isPublishedOnSitemap,
  isUnlistedOnSitemap,
  lastmodForRecord,
  parseArticleSitemapRecord,
  serializeSitemapItem,
  shouldIncludeSitemapPage,
  sitemapExcludeFragments,
  toSitemapDate,
} from '../src/lib/sitemap.ts';

const ORIGIN = 'https://www.morningstacks.com';

test('canonical HTML pages keep a trailing slash', () => {
  assert.equal(canonicalUrl('/', ORIGIN), `${ORIGIN}/`);
  assert.equal(canonicalUrl('/about', ORIGIN), `${ORIGIN}/about/`);
  assert.equal(canonicalUrl('/about/', ORIGIN), `${ORIGIN}/about/`);
  assert.equal(
    canonicalUrl('/ai-tools/openai-cursor-cutoff-november-2026', ORIGIN),
    `${ORIGIN}/ai-tools/openai-cursor-cutoff-november-2026/`,
  );
});

test('canonical file URLs stay extension paths', () => {
  assert.equal(canonicalUrl('/rss.xml', ORIGIN), `${ORIGIN}/rss.xml`);
  assert.equal(canonicalUrl('/llms.txt', ORIGIN), `${ORIGIN}/llms.txt`);
  assert.equal(canonicalUrl('/sitemap-index.xml', ORIGIN), `${ORIGIN}/sitemap-index.xml`);
});

test('sitemap lastmod is a calendar date from updated or date', () => {
  assert.equal(toSitemapDate('2026-09-16'), '2026-09-16');
  assert.equal(toSitemapDate('2026-09-16T00:00:00.000Z'), '2026-09-16');
  const record = parseArticleSitemapRecord(
    'demo.mdx',
    `---
status: published
category: marketing
date: 2026-09-02
updated: 2026-09-16
---
`,
  );
  assert.equal(isPublishedOnSitemap(record), true);
  assert.equal(articlePath(record), '/marketing/demo/');
  assert.equal(lastmodForRecord(record), '2026-09-16');
});

test('unlisted articles are excluded and published ones get lastmod URLs', () => {
  const published = parseArticleSitemapRecord(
    'live.mdx',
    `---
status: published
category: ai-tools
date: 2026-09-02
---
`,
  );
  const unlisted = parseArticleSitemapRecord(
    'preview.mdx',
    `---
status: unlisted
category: ai-tools
date: 2026-09-02
---
`,
  );
  assert.equal(isUnlistedOnSitemap(unlisted), true);
  const fragments = sitemapExcludeFragments([published, unlisted]);
  assert.equal(
    shouldIncludeSitemapPage(`${ORIGIN}/ai-tools/preview/`, fragments),
    false,
  );
  assert.equal(shouldIncludeSitemapPage(`${ORIGIN}/ai-tools/live/`, fragments), true);
  assert.equal(shouldIncludeSitemapPage(`${ORIGIN}/search/`, fragments), false);
  assert.equal(shouldIncludeSitemapPage(`${ORIGIN}/affiliate-disclosure/`, fragments), false);
  assert.equal(shouldIncludeSitemapPage(`${ORIGIN}/go/linear/`, fragments), false);

  const lastmods = articleLastmodByUrl(ORIGIN, [published, unlisted]);
  assert.equal(lastmods.get(`${ORIGIN}/ai-tools/live/`), '2026-09-02');
  assert.equal(lastmods.has(`${ORIGIN}/ai-tools/preview/`), false);

  const serialized = serializeSitemapItem({ url: `${ORIGIN}/ai-tools/live/` }, lastmods);
  assert.equal(serialized.lastmod, '2026-09-02');
});
