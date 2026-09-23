import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getBuildableArticles, getCategories } from '~/lib/content';
import { renderOg } from '~/lib/og';

export const runtime = 'nodejs';

const STATIC_TITLES: Record<string, string> = {
  default: 'Sourced briefings and comparisons.',
  slot: 'OpenAI may cut GPT in Cursor 12 Nov',
  about: 'About MorningStacks',
  methodology: 'How we test',
  disclosure: 'Affiliate disclosure',
  contact: 'Contact MorningStacks',
  newsletter: 'Monday morning, in your inbox.',
  search: 'Search the archive',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  archive: 'All writing',
};

function png(body: Buffer | ArrayBuffer) {
  const bytes =
    body instanceof ArrayBuffer
      ? new Uint8Array(body)
      : new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return new Response(copy, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const key = path.join('/').replace(/\.png$/i, '');
  const slug = path.at(-1)?.replace(/\.png$/i, '') ?? '';

  if (path.length >= 2) {
    try {
      const file = await readFile(join(process.cwd(), 'src/assets/og', slug, 'og.png'));
      return png(file);
    } catch {
      /* fall through to the typographic card */
    }
  }

  let title = STATIC_TITLES[key];
  if (!title && key.startsWith('category-')) {
    const categories = await getCategories();
    title = categories.find((category) => category.slug === key.slice('category-'.length))?.name;
  }
  if (!title && path.length >= 2) {
    const articles = await getBuildableArticles();
    const article = articles.find((item) => item.slug === slug);
    title = article?.ogTitle ?? article?.title;
  }
  if (!title) return new Response('Not found', { status: 404 });

  return png(Buffer.from(await renderOg({ title })));
}
