import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

let cachedFonts: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function loadFonts() {
  const root = resolve(process.cwd(), 'src/assets/fonts');
  const [serif, serifItalic] = await Promise.all([
    readFile(`${root}/lora-medium.ttf`),
    readFile(`${root}/lora-italic.ttf`),
  ]);
  return [
    { name: 'Lora', data: serif, weight: 500 as const, style: 'normal' as const },
    { name: 'Lora', data: serifItalic, weight: 400 as const, style: 'italic' as const },
  ];
}

const CREAM = '#FAF4E8';
const INK = '#1C1916';
const INK_BLUE = '#1E3A5F';

type OgInput = {
  title: string;
};

export async function renderOg(input: OgInput): Promise<ArrayBuffer> {
  if (!cachedFonts) cachedFonts = await loadFonts();

  const node = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: CREAM,
        padding: '64px 72px',
        fontFamily: 'Lora',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Lora',
                    fontWeight: 500,
                    fontSize: '28px',
                    color: INK,
                    letterSpacing: '-0.025em',
                    display: 'flex',
                  },
                  children: [
                    { type: 'span', props: { children: 'MorningStacks' } },
                    { type: 'span', props: { style: { color: INK_BLUE }, children: '.' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginTop: '24px',
                    width: '120px',
                    height: '2px',
                    background: INK_BLUE,
                    display: 'flex',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Lora',
                    fontWeight: 500,
                    fontSize: '64px',
                    color: INK,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    marginTop: '36px',
                    display: 'flex',
                    maxWidth: '980px',
                  },
                  children: input.title,
                },
              },
            ],
          },
        },
      ],
    },
  } as const;

  const svg = await satori(node as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: cachedFonts,
  });

  const png = new Resvg(svg).render().asPng();
  const buffer = new ArrayBuffer(png.byteLength);
  new Uint8Array(buffer).set(png);
  return buffer;
}
