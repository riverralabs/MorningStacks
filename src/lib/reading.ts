import type { ReactNode } from 'react';
import { isValidElement } from 'react';

const WORDS_PER_MINUTE = 230;

function stripMdx(raw: string): string {
  return raw
    .replace(/^import\s.+$/gm, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>|-]/g, ' ');
}

export function readingMinutes(raw: string): number {
  const words = stripMdx(raw).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Same input order gives the same ids, so the contents list and the rendered h2s agree. */
export function createSlugger() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugify(text) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function plainHeading(line: string): string {
  return line
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export type Heading = { id: string; text: string };

export function headingsFrom(raw: string): Heading[] {
  const slug = createSlugger();
  const out: Heading[] = [];
  let fenced = false;
  for (const line of raw.split(/\r?\n/)) {
    if (/^```/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const match = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (!match?.[1]) continue;
    const text = plainHeading(match[1]);
    if (text) out.push({ id: slug(text), text });
  }
  return out;
}

export function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}
