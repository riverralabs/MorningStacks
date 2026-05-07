# MorningStacks

> The software stack for operators and founders. Editorial-first reviews of SaaS, AI tools, and software that operators and founders actually pay for.

Built with **Astro 5 + MDX + Tailwind v4**. Deploys to **Vercel**. Zero JS on article pages.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm typecheck    # astro check (zero errors required)
pnpm lint         # eslint
pnpm build        # astro build + pagefind index
pnpm preview      # serve dist/
```

Requires Node 22+ and pnpm 10+.

## What's here

| Path | Purpose |
| --- | --- |
| `src/content/` | Articles (MDX), products, categories, authors. Schemas in `src/content.config.ts` |
| `src/layouts/` | `BaseLayout`, `ArticleLayout`, `PageLayout` |
| `src/components/seo/BaseHead.astro` | Title, meta, OG, JSON-LD wiring |
| `src/components/ui/` | Buttons, cards, disclosure banner, newsletter form, etc. |
| `src/lib/seo.ts`, `src/lib/schema.ts` | SEO helpers + typed JSON-LD builders (`schema-dts`) |
| `src/lib/newsletter.ts` | Provider-agnostic subscribe interface (stub / beehiiv / convertkit / buttondown) |
| `src/lib/og.ts` + `src/pages/og/[...slug].png.ts` | Build-time OG image generation (Satori + Resvg) |
| `src/pages/api/subscribe.ts` | Vercel Serverless Function — POSTs to whichever provider is configured |
| `src/pages/rss.xml.ts` | RSS feed |
| `public/fonts/` | Self-hosted Lora + Space Grotesk woff2 (Latin subset) for the site |
| `src/assets/fonts/` | TTF copies for Satori OG generation only |
| `brand/` | Brand book v1.1 reference — source of truth for tokens and patterns |

## Authoring articles

Articles live in `src/content/articles/*.mdx`. Frontmatter validated by `src/content.config.ts`.

```mdx
---
type: review              # article | review | roundup
title: Linear review — the issue tracker that finally feels like software
description: 80–220 chars, used as meta description and OG description.
eyebrow: Review
category: productivity    # references src/content/categories/*.md slug
author: the-editors       # references src/content/authors/*.md
date: 2026-04-25
updated: 2026-04-30
products:
  - linear                # references src/content/products/*.md
rating: 4.7
faq:
  - q: Is Linear better than Jira?
    a: ...
related: []
---

<Disclosure /> renders the FTC banner.
<ProductCard product="linear" /> embeds a product card.
<PullQuote cite="...">...</PullQuote>
<Callout tone="info" title="...">...</Callout>
```

The dynamic route `/[category]/[slug]` discovers all non-draft articles. Reviews automatically render the disclosure banner and emit `Review` JSON-LD.

## Newsletter

The form posts to `/api/subscribe`, which calls `src/lib/newsletter.ts`. The current provider is selected via the `NEWSLETTER_PROVIDER` env var (`stub` | `beehiiv` | `convertkit` | `buttondown`). The stub logs and returns success — swap providers by setting the env var and the matching API key (see `.env.example`). The form contract and UI never change.

## Deploy — Vercel

1. Push to GitHub.
2. Vercel dashboard → Add New → Project → Import the repo.
3. Framework preset: **Astro** (auto-detected). Build command and output dir auto-detected from `@astrojs/vercel`.
4. Set environment variables (Project → Settings → Environment Variables):
   - `SITE_URL` — your production URL.
   - `NEWSLETTER_PROVIDER` — `stub` for now.
   - `BEEHIIV_API_KEY` / `BEEHIIV_PUBLICATION_ID` (or the matching ConvertKit / Buttondown vars) when ready.
5. Deploy. The first build runs `pnpm build` (which is `astro build && pagefind --site dist`) and Vercel routes everything via the adapter.

`@astrojs/vercel` outputs prerendered HTML to the static asset CDN and turns `/api/subscribe` (any route with `prerender = false`) into a Vercel Serverless Function. OG images are prerendered at build time, so they're served as cached static PNGs — no runtime cost.

### Local preview

```bash
pnpm build && pnpm preview
```

`vercel dev` also works if you want the full Vercel runtime locally; it's not required for everyday development since `pnpm dev` runs the same Astro server.

## Lint, typecheck, build before every commit

CI (`.github/workflows/ci.yml`) runs all three on every PR. Locally:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Brand

Tokens, type scale, and component patterns mirror the brand book at `brand/morningstacks_voice_and_tone.html`. CSS tokens live in `src/styles/tokens.css` (Tailwind v4 `@theme` block). Don't fork the tokens — edit them in the `@theme` block and they propagate as Tailwind utilities everywhere.
