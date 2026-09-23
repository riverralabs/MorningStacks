import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Assets = {
  fonts: { name: string; data: Buffer; weight: 500 | 600 | 800; style: 'normal' }[];
  wordmark: string;
};

let cached: Assets | null = null;

async function loadAssets(): Promise<Assets> {
  const root = process.cwd();
  const fonts = resolve(root, 'src/assets/fonts');
  const [medium, semibold, heavy, wordmark] = await Promise.all([
    readFile(`${fonts}/schibsted-grotesk-500.ttf`),
    readFile(`${fonts}/schibsted-grotesk-600.ttf`),
    readFile(`${fonts}/schibsted-grotesk-800.ttf`),
    readFile(resolve(root, 'public/brand/morningstacks_wordmark_ink.svg')),
  ]);
  return {
    fonts: [
      { name: 'Schibsted', data: medium, weight: 500, style: 'normal' },
      { name: 'Schibsted', data: semibold, weight: 600, style: 'normal' },
      { name: 'Schibsted', data: heavy, weight: 800, style: 'normal' },
    ],
    wordmark: `data:image/svg+xml;base64,${wordmark.toString('base64')}`,
  };
}

const PAPER = '#FAF9F6';
const INK = '#1C1916';
const INK_2 = '#4A4640';
const NAVY = '#1E3A5F';

export type OgInput = {
  title: string;
  kicker?: string;
};

function titleSize(title: string): number {
  if (title.length > 90) return 54;
  if (title.length > 60) return 62;
  return 72;
}

export async function renderOg(input: OgInput): Promise<ArrayBuffer> {
  if (!cached) cached = await loadAssets();
  const { fonts, wordmark } = cached;

  const node = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: PAPER,
        fontFamily: 'Schibsted',
      },
      children: [
        { type: 'div', props: { style: { height: '16px', background: NAVY, display: 'flex' } } },
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '56px 72px 52px',
            },
            children: [
              {
                type: 'img',
                props: { src: wordmark, width: 340, height: 50, style: { objectFit: 'contain', objectPosition: 'left' } },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    input.kicker
                      ? {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              fontSize: '24px',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: NAVY,
                              marginBottom: '20px',
                            },
                            children: input.kicker,
                          },
                        }
                      : null,
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: `${titleSize(input.title)}px`,
                          fontWeight: 800,
                          lineHeight: 1.04,
                          letterSpacing: '-0.03em',
                          color: INK,
                          maxWidth: '1030px',
                        },
                        children: input.title,
                      },
                    },
                  ].filter(Boolean),
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: `3px solid ${INK}`,
                    paddingTop: '20px',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: INK_2,
                  },
                  children: [
                    { type: 'div', props: { style: { display: 'flex' }, children: 'morningstacks.com' } },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontWeight: 500 },
                        children: input.title.startsWith('Straight answers')
                          ? 'Briefings, roundups, explainers, and reviews'
                          : 'Straight answers on the software you pay for.',
                      },
                    },
                  ],
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
    fonts,
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  const buffer = new ArrayBuffer(png.byteLength);
  new Uint8Array(buffer).set(png);
  return buffer;
}
