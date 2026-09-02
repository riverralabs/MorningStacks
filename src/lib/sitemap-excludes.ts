import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Path fragments to keep out of the generated sitemap. Draft/seed entries
 * are not built, so they never appear. Unlisted entries *are* built (for
 * preview) and must be filtered here.
 */
export function sitemapExcludeFragments(): string[] {
  const fragments = ['/keystatic', '/api/', '/og/'];
  const dir = join(process.cwd(), 'src/content/articles');
  try {
    for (const file of readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const src = readFileSync(join(dir, file), 'utf8');
      const fm = src.split('---')[1] ?? '';
      const status = fm.match(/^\s*status:\s*(\S+)/m)?.[1];
      const unlistedFlag = /^\s*unlisted:\s*true\s*$/m.test(fm);
      const seed = /^\s*seed:\s*true\s*$/m.test(fm);
      const draft =
        status === 'draft' || /^\s*draft:\s*true\s*$/m.test(fm);
      const unlisted = status === 'unlisted' || unlistedFlag;
      if (seed || draft || !unlisted) continue;
      const slug = file.replace(/\.mdx?$/, '');
      const category = fm.match(/^\s*category:\s*(\S+)/m)?.[1];
      if (category) fragments.push(`/${category}/${slug}`);
    }
  } catch {
    // Content directory may be missing in some tooling runs.
  }
  return fragments;
}
