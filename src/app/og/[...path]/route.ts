import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { typeLabel } from '~/lib/content-model';
import { getBuildableArticles, getCategories } from '~/lib/content';
import { renderOg, type OgInput } from '~/lib/og';

export const runtime = 'nodejs';

const STATIC_CARDS: Record<string, OgInput> = {
  default: { title: 'Straight answers on the software you pay for.', kicker: 'For operators and founders' },
  slot: { title: 'OpenAI may cut GPT in Cursor 12 Nov', kicker: 'AI Tools · Briefing' },
  about: { title: 'About MorningStacks', kicker: 'The publication' },
  methodology: { title: 'How we test', kicker: 'The publication' },
  disclosure: { title: 'Affiliate disclosure', kicker: 'Policies' },
  contact: { title: 'Contact MorningStacks', kicker: 'The publication' },
  newsletter: { title: 'The Monday letter', kicker: 'Newsletter' },
  search: { title: 'Search every published piece', kicker: 'Search' },
  privacy: { title: 'Privacy policy', kicker: 'Policies' },
  terms: { title: 'Terms and conditions', kicker: 'Policies' },
  archive: { title: 'Every published piece, newest first', kicker: 'Archive' },
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
      'cache-control': 'public, max-age=86400, s-maxage=31536000',
    },
  });
}

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const key = path.join('/').replace(/\.png$/i, '');
  const slug = path.at(-1)?.replace(/\.png$/i, '') ?? '';

  if (path.length >= 2) {
    try {
      const file = await readFile(join(process.cwd(), 'src/assets/og', slug, 'og.png'));
      return png(file);
    } catch {
      /* no uploaded card; render one below */
    }
  }

  let card: OgInput | undefined = STATIC_CARDS[key];
  if (!card && key.startsWith('category-')) {
    const categories = await getCategories();
    const category = categories.find((item) => item.slug === key.slice('category-'.length));
    if (category) card = { title: category.name, kicker: 'Section' };
  }
  if (!card && path.length >= 2) {
    const [articles, categories] = await Promise.all([getBuildableArticles(), getCategories()]);
    const article = articles.find((item) => item.slug === slug);
    if (article) {
      const section = categories.find((item) => item.slug === article.category)?.name;
      card = {
        title: article.ogTitle ?? article.title,
        kicker: section ? `${section} · ${typeLabel(article.type)}` : typeLabel(article.type),
      };
    }
  }
  if (!card) return new Response('Not found', { status: 404 });

  return png(Buffer.from(await renderOg(card)));
}
