import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

let cachedFonts: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function loadFonts() {
  const root = resolve(process.cwd(), 'src/assets/fonts');
  const [serif, serifItalic, sans] = await Promise.all([
    readFile(`${root}/lora-medium.ttf`),
    readFile(`${root}/lora-italic.ttf`),
    readFile(`${root}/space-grotesk-bold.ttf`),
  ]);
  return [
    { name: 'Lora', data: serif, weight: 500 as const, style: 'normal' as const },
    { name: 'Lora', data: serifItalic, weight: 400 as const, style: 'italic' as const },
    { name: 'Space Grotesk', data: sans, weight: 700 as const, style: 'normal' as const },
  ];
}

const CREAM = '#FAF4E8';
const INK = '#1C1916';
const BLUE = '#1E3A5F';
const INK_70 = 'rgba(28,25,22,0.7)';

type OgInput = {
  title: string;
  eyebrow?: string;
  description?: string;
  badge?: string;
  slot?: boolean;
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
        position: 'relative',
        fontFamily: 'Space Grotesk',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '14px',
              background: BLUE,
              display: 'flex',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              input.eyebrow
                ? {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'Space Grotesk',
                        fontWeight: 700,
                        fontSize: '20px',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        color: BLUE,
                        display: 'flex',
                      },
                      children: input.eyebrow,
                    },
                  }
                : null,
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: input.slot ? 'Lora' : 'Space Grotesk',
                    fontWeight: input.slot ? 500 : 700,
                    fontSize: input.slot ? '56px' : '76px',
                    color: INK,
                    lineHeight: 1.05,
                    letterSpacing: input.slot ? '-1px' : '-2.5px',
                    marginTop: '20px',
                    display: 'flex',
                  },
                  children: input.title,
                },
              },
              input.description
                ? {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'Lora',
                        fontStyle: 'italic',
                        fontSize: '24px',
                        color: INK_70,
                        lineHeight: 1.5,
                        marginTop: '24px',
                        display: 'flex',
                        maxWidth: '900px',
                      },
                      children: input.description,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Lora',
                    fontWeight: 500,
                    fontSize: '32px',
                    color: INK,
                    letterSpacing: '-0.6px',
                    display: 'flex',
                  },
                  children: [
                    { type: 'span', props: { children: 'MorningStacks' } },
                    { type: 'span', props: { style: { color: BLUE }, children: '.' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Space Grotesk',
                    fontWeight: 700,
                    fontSize: '14px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: INK_70,
                    display: 'flex',
                  },
                  children: input.badge ?? (input.slot ? '1200 x 630' : 'Independent reviews'),
                },
              },
            ],
          },
        },
      ],
    },
  } as const;

  // Cast through unknown — satori's JSX type is overly strict for our object literal.
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
