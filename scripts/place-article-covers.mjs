#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const COVERS = [
  {
    slug: 'beehiiv-pricing-review',
    section: 'ai-tools',
    heroAlt: 'Overhead desk with a tablet, earbuds, notebooks, a phone, and a latte.',
  },
  {
    slug: 'best-ai-coding-tools-solo-founders-2026',
    section: 'ai-tools',
    heroAlt: 'Silver laptop showing a dark code editor on a white desk.',
  },
  {
    slug: 'chatgpt-plus-vs-claude-pro-vs-google-ai-pro',
    section: 'ai-tools',
    heroAlt: 'Two monitors with a matching geometric wallpaper under blue light.',
  },
  {
    slug: 'claude-fable-5-1-explained',
    section: 'ai-tools',
    heroAlt: 'Open book, eyeglasses, and a latte on a white table.',
  },
  {
    slug: 'claude-fable-effort-levels-cost',
    section: 'ai-tools',
    heroAlt: 'Close-up of a black TONE control knob on a numbered dial.',
  },
  {
    slug: 'cursor-vs-claude-code-2026',
    section: 'ai-tools',
    heroAlt: 'Monitor and laptop on a desk, both showing a winter road wallpaper.',
  },
  {
    slug: 'dual-home-cursor-claude-code',
    section: 'ai-tools',
    heroAlt: 'Two laptops on a wood table with coffee, glasses, and a phone.',
  },
  {
    slug: 'openai-api-pricing-solo-builders',
    section: 'ai-tools',
    heroAlt: 'Calculator, notepad, and US dollar bills on a white desk.',
  },
  {
    slug: 'openai-cursor-cutoff-november-2026',
    section: 'ai-tools',
    heroAlt: 'White coffee mug on an open November planner.',
  },
  {
    slug: 'perplexity-pro-vs-chatgpt-research',
    section: 'ai-tools',
    heroAlt: 'Lamp-lit desk with a laptop, notes, and a research book.',
  },
  {
    slug: 'windsurf-vs-cursor-vs-claude-code',
    section: 'ai-tools',
    heroAlt: 'Laptop, ultrawide monitor, and tablet lined up on a white desk.',
  },
  {
    slug: 'resend-vs-sendgrid',
    section: 'developer-tools',
    heroAlt: 'Stack of opened envelopes and windowed mail on a table.',
  },
  {
    slug: 'supabase-vs-firebase-saas-mvp',
    section: 'developer-tools',
    heroAlt: 'Blue fiber patch cables plugged into a server patch panel.',
  },
  {
    slug: 'vercel-vs-netlify-vs-cloudflare-pages',
    section: 'developer-tools',
    heroAlt: 'Cardboard shipping boxes and mailers on a warehouse shelf.',
  },
  {
    slug: 'get-site-indexed-google-search-console',
    section: 'marketing',
    heroAlt: 'Black magnifying glass beside a closed silver laptop.',
  },
  {
    slug: 'systeme-vs-clickfunnels',
    section: 'marketing',
    heroAlt: 'White plumbing manifold with a row of flow meters.',
  },
  {
    slug: 'linear-vs-jira-small-saas',
    section: 'productivity',
    heroAlt: 'Pink and yellow sticky notes covering an office wall.',
  },
  {
    slug: 'zapier-vs-make-vs-n8n-2026',
    section: 'productivity',
    heroAlt: 'Three braided cables fading from blue to red on a white background.',
  },
];

export function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function yamlQuote(value) {
  return JSON.stringify(value);
}

export function setScalar(fm, key, value) {
  const line = `${key}: ${value}`;
  const re = new RegExp(`^${key}:\\s*.*$`, 'm');
  if (re.test(fm)) return fm.replace(re, line);
  const anchor = fm.match(/^updated:\s*.*$/m) ?? fm.match(/^date:\s*.*$/m);
  if (!anchor) throw new Error(`no date/updated line to insert ${key}`);
  return fm.replace(anchor[0], `${anchor[0]}\n${line}`);
}

export function patchFrontmatter(raw, fields) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('missing YAML frontmatter');
  let fm = match[1];
  for (const [key, value] of Object.entries(fields)) {
    fm = setScalar(fm, key, value);
  }
  return raw.replace(match[1], fm);
}

export function pathsFor(slug) {
  return {
    mdx: join(root, 'src/content/articles', `${slug}.mdx`),
    og: join(root, 'src/assets/og', slug, 'og.png'),
    hero: join(root, 'src/assets/articles', slug, 'hero.png'),
  };
}

function assertPng1200x630(file, buf) {
  const size = pngSize(buf);
  if (!size) throw new Error(`${file}: not a PNG`);
  if (size.width !== 1200 || size.height !== 630) {
    throw new Error(`${file}: expected 1200x630, got ${size.width}x${size.height}`);
  }
}

export function placeCovers(exportsDir) {
  const placed = [];
  for (const cover of COVERS) {
    const src = join(exportsDir, `${cover.slug}.png`);
    const bytes = readFileSync(src);
    assertPng1200x630(src, bytes);
    const dest = pathsFor(cover.slug);
    mkdirSync(dirname(dest.og), { recursive: true });
    mkdirSync(dirname(dest.hero), { recursive: true });
    copyFileSync(src, dest.og);
    copyFileSync(src, dest.hero);
    const raw = readFileSync(dest.mdx, 'utf8');
    const next = patchFrontmatter(raw, {
      hero: `../../assets/articles/${cover.slug}/hero.png`,
      heroAlt: yamlQuote(cover.heroAlt),
      og: `../../assets/og/${cover.slug}/og.png`,
    });
    writeFileSync(dest.mdx, next);
    placed.push(cover.slug);
  }
  return placed;
}

export function checkCovers() {
  const errors = [];
  for (const cover of COVERS) {
    const dest = pathsFor(cover.slug);
    let og;
    let hero;
    try {
      og = readFileSync(dest.og);
    } catch {
      errors.push(`${cover.slug}: missing ${dest.og}`);
      continue;
    }
    try {
      hero = readFileSync(dest.hero);
    } catch {
      errors.push(`${cover.slug}: missing ${dest.hero}`);
      continue;
    }
    try {
      assertPng1200x630(dest.og, og);
      assertPng1200x630(dest.hero, hero);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
    if (!og.equals(hero)) errors.push(`${cover.slug}: hero bytes differ from og bytes`);
    const raw = readFileSync(dest.mdx, 'utf8');
    if (!raw.includes(`hero: ../../assets/articles/${cover.slug}/hero.png`)) {
      errors.push(`${cover.slug}: MDX hero path missing`);
    }
    if (!raw.includes(`og: ../../assets/og/${cover.slug}/og.png`)) {
      errors.push(`${cover.slug}: MDX og path missing`);
    }
    if (!raw.includes(`heroAlt:`)) errors.push(`${cover.slug}: MDX heroAlt missing`);
  }
  return errors;
}

function parseArgs(argv) {
  const fromIndex = argv.indexOf('--from');
  return {
    from: fromIndex >= 0 ? argv[fromIndex + 1] : null,
    check: argv.includes('--check'),
  };
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const args = parseArgs(process.argv.slice(2));
  if (args.from) {
    const placed = placeCovers(args.from);
    console.info(`placed ${placed.length} covers from ${args.from}`);
  }
  if (args.check || args.from) {
    const errors = checkCovers();
    if (errors.length) {
      console.error(errors.join('\n'));
      process.exit(1);
    }
    console.info(`checked ${COVERS.length} covers`);
  }
  if (!args.from && !args.check) {
    console.error('usage: node scripts/place-article-covers.mjs --from <exportsDir> | --check');
    process.exit(2);
  }
}
