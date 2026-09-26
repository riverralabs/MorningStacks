#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const COVERS = [
  {
    slug: 'beehiiv-pricing-review',
    section: 'ai-tools',
    heroAlt: 'MorningStacks cover with the beehiiv name, a publish dashboard mock, and the line What you get for the money.',
  },
  {
    slug: 'best-ai-coding-tools-solo-founders-2026',
    section: 'ai-tools',
    heroAlt: 'MorningStacks cover with a code editor and AI sidebar next to the line Best AI Coding Tools.',
  },
  {
    slug: 'chatgpt-plus-vs-claude-pro-vs-google-ai-pro',
    section: 'ai-tools',
    heroAlt: 'Cover with a laptop on a desk and the headline ChatGPT Plus vs Claude Pro.',
  },
  {
    slug: 'claude-fable-5-1-explained',
    section: 'ai-tools',
    heroAlt: 'Cream cover with the line Claude Fable 5.1 explained and a small hourglass mark.',
  },
  {
    slug: 'claude-fable-effort-levels-cost',
    section: 'ai-tools',
    heroAlt: 'MorningStacks cover with Low, Medium, and High sliders under Claude Fable effort levels and cost.',
  },
  {
    slug: 'cursor-vs-claude-code-2026',
    section: 'ai-tools',
    heroAlt: 'MorningStacks cover with an empty IDE pane next to a dark Terminal pane under Cursor vs Claude Code.',
  },
  {
    slug: 'dual-home-cursor-claude-code',
    section: 'ai-tools',
    heroAlt: 'MorningStacks cover with two nodes labeled Cursor and Claude under One workflow, two homes.',
  },
  {
    slug: 'openai-api-pricing-solo-builders',
    section: 'ai-tools',
    heroAlt: 'Cover with key and token cards beside the headline OpenAI API pricing explained.',
  },
  {
    slug: 'openai-cursor-cutoff-november-2026',
    section: 'ai-tools',
    heroAlt: 'Cover for the OpenAI and Cursor November 2026 cutoff with an abstract navy wave.',
  },
  {
    slug: 'perplexity-pro-vs-chatgpt-research',
    section: 'ai-tools',
    heroAlt: 'Cover with a document stack beside chat bubbles under Perplexity Pro vs ChatGPT for research.',
  },
  {
    slug: 'windsurf-vs-cursor-vs-claude-code',
    section: 'ai-tools',
    heroAlt: 'Cover with a laptop showing code next to Windsurf vs Cursor vs Claude Code.',
  },
  {
    slug: 'resend-vs-sendgrid',
    section: 'developer-tools',
    heroAlt: 'Cover with floating envelopes and the headline Resend versus SendGrid.',
  },
  {
    slug: 'supabase-vs-firebase-saas-mvp',
    section: 'developer-tools',
    heroAlt: 'Cover with database cylinders under Supabase vs Firebase for SaaS MVP.',
  },
  {
    slug: 'vercel-vs-netlify-vs-cloudflare-pages',
    section: 'developer-tools',
    heroAlt: 'Cover with three globe tiles under Vercel vs Netlify vs Cloudflare Pages.',
  },
  {
    slug: 'get-site-indexed-google-search-console',
    section: 'marketing',
    heroAlt: 'Cover with a row of green checkmarks under Get Your Site Indexed in Google Search Console.',
  },
  {
    slug: 'systeme-vs-clickfunnels',
    section: 'marketing',
    heroAlt: 'Cover with a four-color funnel graphic and the headline Systeme versus ClickFunnels.',
  },
  {
    slug: 'linear-vs-jira-small-saas',
    section: 'productivity',
    heroAlt: 'MorningStacks cover with two issue-board frames under Linear vs Jira for small SaaS.',
  },
  {
    slug: 'zapier-vs-make-vs-n8n-2026',
    section: 'productivity',
    heroAlt: 'Cover with a three-node Zapier, Make, and n8n diagram under Zapier vs Make vs n8n in 2026.',
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
