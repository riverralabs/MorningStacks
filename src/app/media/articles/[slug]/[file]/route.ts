import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await context.params;
  if (slug.includes('..') || file.includes('..') || file.includes('/')) {
    return new Response('Not found', { status: 404 });
  }
  const ext = file.split('.').pop()?.toLowerCase() ?? '';
  const type = TYPES[ext];
  if (!type) return new Response('Not found', { status: 404 });
  try {
    const body = await readFile(join(process.cwd(), 'src/assets/articles', slug, file));
    const bytes = new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    const copy = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(copy).set(bytes);
    return new Response(copy, {
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=86400, s-maxage=31536000',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
