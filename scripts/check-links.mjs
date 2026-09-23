#!/usr/bin/env node
/**
 * Crawl a running MorningStacks server and report broken links.
 *   node scripts/check-links.mjs http://127.0.0.1:3000            internal links only
 *   node scripts/check-links.mjs http://127.0.0.1:3000 --external  also check outbound links
 */
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3000');
const checkExternal = process.argv.includes('--external');
const UA = 'Mozilla/5.0 (compatible; MorningStacksLinkCheck/1.0; +https://www.morningstacks.com/contact/)';
const SKIP = [/^\/keystatic/, /^\/api\//, /^\/go\//];

const pages = new Set(['/']);
const queue = ['/'];
const internal = new Map();
const external = new Map();

function hrefs(html) {
  const out = [];
  for (const match of html.matchAll(/<(?:a|link)\b[^>]*?\bhref="([^"]+)"/g)) out.push(match[1]);
  for (const match of html.matchAll(/<img\b[^>]*?\bsrc="([^"]+)"/g)) out.push(match[1]);
  return out.map((href) => href.replace(/&amp;/g, '&'));
}

function record(map, url, from) {
  if (!map.has(url)) map.set(url, new Set());
  map.get(url).add(from);
}

async function status(url, method = 'HEAD') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { method, redirect: 'follow', signal: controller.signal, headers: { 'user-agent': UA } });
    if (method === 'HEAD' && (res.status === 405 || res.status === 403 || res.status === 404)) return status(url, 'GET');
    return res.status;
  } catch (error) {
    return method === 'HEAD' ? status(url, 'GET') : `error: ${error.cause?.code ?? error.name}`;
  } finally {
    clearTimeout(timer);
  }
}

while (queue.length) {
  const path = queue.shift();
  const res = await fetch(new URL(path, base), { headers: { 'user-agent': UA } });
  if (!(res.headers.get('content-type') ?? '').includes('text/html')) continue;
  const html = await res.text();
  for (const raw of hrefs(html)) {
    if (/^(mailto:|tel:|#|javascript:|data:)/.test(raw)) continue;
    const url = new URL(raw, new URL(path, base));
    const sameSite = url.host === base.host || /(^|\.)morningstacks\.com$/.test(url.hostname);
    if (!sameSite) {
      if (/^https?:$/.test(url.protocol)) record(external, url.href.replace(/#.*$/, ''), path);
      continue;
    }
    const local = url.pathname + url.search;
    if (SKIP.some((pattern) => pattern.test(url.pathname))) continue;
    record(internal, local, path);
    if (!pages.has(url.pathname) && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      pages.add(url.pathname);
      queue.push(url.pathname);
    }
  }
}

const failures = [];
for (const [path, from] of internal) {
  const code = await status(new URL(path, base).href, 'GET');
  if (code !== 200) failures.push({ url: path, code, from: [...from].slice(0, 3) });
}

const externalFailures = [];
if (checkExternal) {
  const entries = [...external.entries()];
  for (let i = 0; i < entries.length; i += 8) {
    await Promise.all(
      entries.slice(i, i + 8).map(async ([url, from]) => {
        const code = await status(url);
        if (typeof code !== 'number' || code >= 400) externalFailures.push({ url, code, from: [...from].slice(0, 3) });
      }),
    );
  }
}

console.info(`Crawled ${pages.size} pages, ${internal.size} internal URLs, ${external.size} external URLs.`);
for (const failure of failures) console.error(`BROKEN internal ${failure.code} ${failure.url}  (from ${failure.from.join(', ')})`);
for (const failure of externalFailures) console.warn(`CHECK external ${failure.code} ${failure.url}  (from ${failure.from.join(', ')})`);
if (failures.length) process.exit(1);
