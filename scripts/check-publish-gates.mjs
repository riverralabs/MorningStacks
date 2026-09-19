#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { featuredPublishedCount, publishGateErrors } from '../src/lib/content-model.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const articlesDir = join(root, 'src/content/articles');

function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`${file}: missing YAML frontmatter`);
  }
  return match[1];
}

function scalar(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!match) return undefined;
  const value = match[1].trim();
  if (value === '' || value === '>' || value === '>-' || value === '|' || value === '|-') {
    const lines = [];
    const start = fm.indexOf(match[0]) + match[0].length;
    const rest = fm.slice(start).split(/\r?\n/);
    for (const line of rest) {
      if (line === '' && lines.length === 0) continue;
      if (/^\s{2,}/.test(line) || (line === '' && lines.length > 0)) {
        lines.push(line.replace(/^\s{2}/, ''));
        continue;
      }
      break;
    }
    return lines.join(' ').replace(/\s+/g, ' ').trim();
  }
  if (value === '[]') return [];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value.replace(/^['"]|['"]$/g, '');
}

function listItems(fm, key) {
  const header = fm.match(new RegExp(`^${key}:[ \\t]*(\\S.*)?$`, 'm'));
  if (!header) return [];
  const inline = (header[1] ?? '').trim();
  if (inline === '[]') return [];
  const items = [];
  if (inline.startsWith('- ')) items.push(inline.slice(2).trim());
  const start = fm.indexOf(header[0]) + header[0].length;
  const rest = fm.slice(start).split(/\r?\n/);
  for (const line of rest) {
    if (/^\s*-\s+\S/.test(line)) {
      items.push(line.replace(/^\s*-\s+/, '').trim());
      continue;
    }
    if (line === '' || /^\s+/.test(line)) continue;
    break;
  }
  return items;
}

function loadArticles() {
  return readdirSync(articlesDir)
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .map((name) => {
      const raw = readFileSync(join(articlesDir, name), 'utf8');
      const fm = parseFrontmatter(raw, name);
      return {
        file: name,
        type: String(scalar(fm, 'type') ?? ''),
        status: String(scalar(fm, 'status') ?? ''),
        seed: scalar(fm, 'seed') === true,
        template: scalar(fm, 'template') === true,
        title: scalar(fm, 'title'),
        description: scalar(fm, 'description'),
        eyebrow: scalar(fm, 'eyebrow'),
        category: scalar(fm, 'category'),
        author: scalar(fm, 'author'),
        date: scalar(fm, 'date'),
        answer: scalar(fm, 'answer'),
        sources: listItems(fm, 'sources'),
        products: listItems(fm, 'products'),
        lastTested: scalar(fm, 'lastTested'),
        testMethod: scalar(fm, 'testMethod'),
        featured: scalar(fm, 'featured') === true,
      };
    });
}

function main() {
  const articles = loadArticles();
  const failures = [];

  for (const article of articles) {
    if (!article.author) {
      failures.push(`${article.file}: author is required`);
    }
    for (const error of publishGateErrors(article)) {
      failures.push(`${article.file}: ${error.path}: ${error.message}`);
    }
  }

  const featuredCount = featuredPublishedCount(articles);
  if (featuredCount > 1) {
    failures.push(`featured: ${featuredCount} published featured pieces; max is 1`);
  }

  if (failures.length) {
    console.error('Publish gates failed:\n' + failures.map((line) => `  - ${line}`).join('\n'));
    process.exit(1);
  }

  const live = articles.filter((article) => article.status === 'published' && !article.seed);
  console.info(`Publish gates passed for ${live.length} live pieces (${articles.length} total).`);
}

main();
