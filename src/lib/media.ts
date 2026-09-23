import 'server-only';
import { openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

export type Size = { width: number; height: number };

const cache = new Map<string, Size | null>();

function readHead(file: string, bytes = 65536): Buffer | null {
  try {
    const fd = openSync(file, 'r');
    const buffer = Buffer.alloc(bytes);
    const read = readSync(fd, buffer, 0, bytes, 0);
    closeSync(fd);
    return buffer.subarray(0, read);
  } catch {
    return null;
  }
}

function pngSize(buf: Buffer): Size | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf: Buffer): Size | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1] ?? 0;
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(buf: Buffer): Size | null {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/** Pixel size of an article image served from /media/articles/{slug}/{file}. */
export function mediaSize(url: string | null | undefined): Size | null {
  if (!url) return null;
  if (cache.has(url)) return cache.get(url) ?? null;
  const match = url.match(/^\/media\/articles\/([^/]+)\/([^/?#]+)$/);
  let size: Size | null = null;
  if (match?.[1] && match[2]) {
    const head = readHead(join(process.cwd(), 'src/assets/articles', match[1], match[2]));
    if (head) size = pngSize(head) ?? jpegSize(head) ?? webpSize(head);
  }
  cache.set(url, size);
  return size;
}
