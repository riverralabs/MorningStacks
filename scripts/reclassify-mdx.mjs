#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/content/articles');

const ourPicks = {
  'zapier-vs-make-vs-n8n-2026.mdx':
    'Zapier for catalog breadth, Make for visual cost control, n8n for code or execution billing.',
  'vercel-vs-netlify-vs-cloudflare-pages.mdx':
    'Vercel for Next-shaped deploys, Netlify for credit-based cadence, Cloudflare Pages when static bandwidth should stay free.',
  'systeme-vs-clickfunnels.mdx':
    'Systeme.io Free unless you already need ClickFunnels workspaces, onboarding culture, or API access.',
  'cursor-vs-claude-code-2026.mdx':
    'Cursor if the IDE is home base. Claude Code if you live in the terminal and already pay for Claude.',
  'perplexity-pro-vs-chatgpt-research.mdx':
    'Perplexity Pro when the answer must cite the open web. ChatGPT Plus when research sits next to writing.',
  'chatgpt-plus-vs-claude-pro-vs-google-ai-pro.mdx':
    'ChatGPT for broad tooling and Codex, Claude for Claude Code, Google AI Pro if you live in Workspace.',
  'linear-vs-jira-small-saas.mdx':
    'Linear for a small SaaS team that wants a fast, opinionated tracker. Jira when Atlassian adjacency or a larger admin surface matters.',
  'windsurf-vs-cursor-vs-claude-code.mdx':
    'Cursor or Windsurf for IDE-native agents. Claude Code when you want Anthropic\'s agent on a Claude subscription.',
  'supabase-vs-firebase-saas-mvp.mdx':
    'Supabase for relational Postgres and RLS. Firebase for document/realtime NoSQL and Google Cloud adjacency.',
  'resend-vs-sendgrid.mdx':
    'Resend for a modern API and React Email. SendGrid for mature deliverability tooling and dedicated IPs.',
  'best-ai-coding-tools-solo-founders-2026.mdx':
    'Start with one IDE agent plus one chat/terminal agent. Add Copilot only if GitHub is already home.',
};

const map = {
  'openai-cursor-cutoff-november-2026.mdx': { type: 'briefing', eyebrow: 'Sourced briefing' },
  'claude-fable-5-1-explained.mdx': { type: 'explainer', eyebrow: 'Sourced explainer' },
  'claude-fable-effort-levels-cost.mdx': { type: 'explainer', eyebrow: 'Sourced explainer' },
  'openai-api-pricing-solo-builders.mdx': { type: 'explainer', eyebrow: 'Sourced explainer' },
  'dual-home-cursor-claude-code.mdx': { type: 'explainer', eyebrow: 'Sourced how-to' },
  'get-site-indexed-google-search-console.mdx': { type: 'explainer', eyebrow: 'Sourced how-to' },
  'beehiiv-pricing-review.mdx': { type: 'explainer', eyebrow: 'Sourced explainer' },
  'zapier-vs-make-vs-n8n-2026.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'vercel-vs-netlify-vs-cloudflare-pages.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'systeme-vs-clickfunnels.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'cursor-vs-claude-code-2026.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'perplexity-pro-vs-chatgpt-research.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'chatgpt-plus-vs-claude-pro-vs-google-ai-pro.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'linear-vs-jira-small-saas.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'windsurf-vs-cursor-vs-claude-code.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'supabase-vs-firebase-saas-mvp.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'resend-vs-sendgrid.mdx': { type: 'roundup', eyebrow: 'Sourced comparison' },
  'best-ai-coding-tools-solo-founders-2026.mdx': { type: 'roundup', eyebrow: 'Sourced roundup' },
  'why-we-test-software-the-hard-way.mdx': { type: 'explainer' },
};

function setOrInsertAfter(fm, key, value, afterKey) {
  const line = `${key}: ${value}`;
  if (new RegExp(`^${key}:`, 'm').test(fm)) {
    return fm.replace(new RegExp(`^${key}:.*$`, 'm'), line);
  }
  if (afterKey && new RegExp(`^${afterKey}:`, 'm').test(fm)) {
    return fm.replace(new RegExp(`^(${afterKey}:.*)$`, 'm'), `$1\n${line}`);
  }
  return `${line}\n${fm}`;
}

for (const [file, change] of Object.entries(map)) {
  const path = join(dir, file);
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`No frontmatter in ${file}`);
  let fm = match[1];
  if (change.type) {
    fm = fm.replace(/^type:.*$/m, `type: ${change.type}`);
  }
  if (change.eyebrow) {
    fm = fm.replace(/^eyebrow:.*$/m, `eyebrow: ${change.eyebrow}`);
  }
  if (!/^author:/m.test(fm)) {
    fm = setOrInsertAfter(fm, 'author', 'dipen', 'category');
  }
  if (change.type === 'roundup' && ourPicks[file] && !/^ourPick:/m.test(fm)) {
    fm = setOrInsertAfter(fm, 'ourPick', JSON.stringify(ourPicks[file]), 'products');
  }
  writeFileSync(path, raw.replace(match[1], fm));
  console.info(`updated ${file}`);
}

const linearPath = join(dir, 'linear-review.mdx');
const linearRaw = readFileSync(linearPath, 'utf8');
const linearMatch = linearRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
let linearFm = linearMatch[1];
if (!/^lastTested:/m.test(linearFm)) {
  linearFm = setOrInsertAfter(linearFm, 'lastTested', '2026-04-30', 'rating');
}
if (!/^testMethod:/m.test(linearFm)) {
  linearFm = setOrInsertAfter(
    linearFm,
    'testMethod',
    JSON.stringify('Twelve sprints across three teams. Seed draft. Not live evidence.'),
    'lastTested',
  );
}
writeFileSync(linearPath, linearRaw.replace(linearMatch[1], linearFm));
console.info('updated linear-review.mdx');

const duplicateTemplate = join(dir, 'systeme-io-vs-clickfunnels.mdx');
if (existsSync(duplicateTemplate)) {
  unlinkSync(duplicateTemplate);
  console.info('deleted systeme-io-vs-clickfunnels.mdx');
}
