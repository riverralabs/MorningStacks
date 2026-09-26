import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  COVERS,
  checkCovers,
  patchFrontmatter,
  pngSize,
  setScalar,
  yamlQuote,
} from './place-article-covers.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('cover table is the 18 published slugs', () => {
  const slugs = COVERS.map((cover) => cover.slug);
  assert.equal(slugs.length, 18);
  assert.equal(new Set(slugs).size, 18);
  assert.deepEqual(
    slugs,
    [
      'beehiiv-pricing-review',
      'best-ai-coding-tools-solo-founders-2026',
      'chatgpt-plus-vs-claude-pro-vs-google-ai-pro',
      'claude-fable-5-1-explained',
      'claude-fable-effort-levels-cost',
      'cursor-vs-claude-code-2026',
      'dual-home-cursor-claude-code',
      'openai-api-pricing-solo-builders',
      'openai-cursor-cutoff-november-2026',
      'perplexity-pro-vs-chatgpt-research',
      'windsurf-vs-cursor-vs-claude-code',
      'resend-vs-sendgrid',
      'supabase-vs-firebase-saas-mvp',
      'vercel-vs-netlify-vs-cloudflare-pages',
      'get-site-indexed-google-search-console',
      'systeme-vs-clickfunnels',
      'linear-vs-jira-small-saas',
      'zapier-vs-make-vs-n8n-2026',
    ],
  );
});

test('pngSize reads IHDR width and height', () => {
  const buf = Buffer.alloc(24);
  buf.writeUInt32BE(0x89504e47, 0);
  buf.writeUInt32BE(1200, 16);
  buf.writeUInt32BE(630, 20);
  assert.deepEqual(pngSize(buf), { width: 1200, height: 630 });
  assert.equal(pngSize(Buffer.alloc(8)), null);
});

test('setScalar replaces or inserts after date', () => {
  const first = setScalar('date: 2026-09-10\nogAlt: old', 'hero', '../../assets/articles/demo/hero.png');
  assert.equal(first, 'date: 2026-09-10\nhero: ../../assets/articles/demo/hero.png\nogAlt: old');
  const second = setScalar(first, 'hero', '../../assets/articles/demo/hero.png');
  assert.equal(second, first);
});

test('patchFrontmatter writes hero, heroAlt, and og', () => {
  const raw = `---
title: Demo
date: 2026-09-10
ogAlt: old
---

body
`;
  const next = patchFrontmatter(raw, {
    hero: '../../assets/articles/demo/hero.png',
    heroAlt: yamlQuote('A cover.'),
    og: '../../assets/og/demo/og.png',
  });
  assert.match(next, /^hero: \.\.\/\.\.\/assets\/articles\/demo\/hero\.png$/m);
  assert.match(next, /^heroAlt: "A cover\."$/m);
  assert.match(next, /^og: \.\.\/\.\.\/assets\/og\/demo\/og\.png$/m);
});

test('placed covers stay on the live hero and og paths', () => {
  assert.deepEqual(checkCovers(), []);
});

test('Keystatic image fields append the entry slug and must not contain a literal {slug}', () => {
  const src = readFileSync(join(repoRoot, 'keystatic.config.ts'), 'utf8');
  assert.match(src, /hero: fields\.image\(\{[\s\S]*?directory: 'src\/assets\/articles'/);
  assert.match(src, /hero: fields\.image\(\{[\s\S]*?publicPath: '\.\.\/\.\.\/assets\/articles\/'/);
  assert.match(src, /og: fields\.image\(\{[\s\S]*?directory: 'src\/assets\/og'/);
  assert.match(src, /og: fields\.image\(\{[\s\S]*?publicPath: '\.\.\/\.\.\/assets\/og\/'/);
  assert.match(src, /image: \{\s*directory: 'src\/assets\/articles'/);
  assert.equal(src.includes("directory: 'src/assets/heroes"), false);
  assert.equal(/directory: '[^']*\{slug\}/.test(src), false);
  assert.equal(/publicPath: '[^']*\{slug\}/.test(src), false);
});
