# MorningStacks

> The software stack for operators and founders. Editorial-first reviews of SaaS, AI tools, and software that operators and founders actually pay for.

Built with **Astro 5 + MDX + Tailwind v4**. Deploys to **Vercel**. Zero JS on article pages. Jane edits in **Keystatic** (`/keystatic`), which commits MDX back to this repo. No separate CMS vendor.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:4321  ·  admin: http://127.0.0.1:4321/keystatic
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
| `keystatic.config.ts` | Git-backed admin mapped onto those same collections |
| `src/layouts/` | `BaseLayout`, `ArticleLayout`, `PageLayout` |
| `src/components/seo/BaseHead.astro` | Title, meta, OG, JSON-LD wiring |
| `src/components/ui/` | Buttons, cards, disclosure banner, newsletter form, etc. |
| `src/lib/seo.ts`, `src/lib/schema.ts` | SEO helpers + typed JSON-LD builders (`schema-dts`) |
| `src/lib/publish.ts` | Draft / unlisted / published / seed visibility |
| `src/lib/newsletter.ts` | Provider-agnostic subscribe interface (stub / beehiiv / convertkit / buttondown) |
| `src/lib/og.ts` + `src/pages/og/[...slug].png.ts` | 1200×630 OG slots (typographic placeholder until Kinjal uploads) |
| `src/pages/llms.txt.ts` | AEO/GEO file for assistants; lists published articles only |
| `src/pages/rss.xml.ts` | RSS feed (published only) |
| `public/fonts/` | Self-hosted Lora + Space Grotesk woff2 (Latin subset) for the site |
| `src/assets/fonts/` | TTF copies for Satori OG generation only |
| `brand/` | Brand book v1.1 reference. Source of truth for tokens and patterns |

## Authoring articles

Jane should prefer Keystatic at `/keystatic` (local filesystem in `pnpm dev`; GitHub mode on Vercel when the Keystatic GitHub App env vars are set). Articles still live in `src/content/articles/*.mdx`. Frontmatter is validated by `src/content.config.ts`.

Visibility:

| `status` | What happens |
| --- | --- |
| `draft` | Not built. Not on the live domain. Not in RSS, sitemap, home, or sections. |
| `unlisted` | Built for preview. `noindex`. Kept out of RSS, sitemap, home, and sections. |
| `published` | Live, listed, indexed. |

`seed: true` is a hold flag for leftover placeholder articles. Seed entries stay off the live domain even if someone flips visibility. Do not delete them without clearing that flag on purpose.

The Jane comparison skeleton is `src/content/articles/systeme-io-vs-clickfunnels.mdx` (`template: true`, `status: draft`). It is not an article. Do not invent first-person tests. Kinjal fills the 1200×630 OG slot after the verified draft lands.

```mdx
---
type: review              # article | review | roundup
status: draft             # draft | unlisted | published
title: Linear review
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
<ComparisonTable> wrap a markdown table </ComparisonTable>
```

Reviews automatically render the disclosure banner and emit `Review` JSON-LD. FAQ pairs emit `FAQPage` JSON-LD.

Affiliate URLs use `?via=morningstacks` (not `via=morning-stacks`). Older `?ref=morningstacks` placeholders were normalized to `via`.

## Newsletter

The form posts to `/api/subscribe`, which calls `src/lib/newsletter.ts`. The current provider is selected via the `NEWSLETTER_PROVIDER` env var (`stub` | `beehiiv` | `convertkit` | `buttondown`). The stub logs and returns success. Swap providers by setting the env var and the matching API key (see `.env.example`). The form contract and UI never change.

## Deploy. Vercel

1. Push to GitHub.
2. Vercel dashboard → Add New → Project → Import the repo.
3. Framework preset: **Astro** (auto-detected). Build command and output dir auto-detected from `@astrojs/vercel`.
4. Set environment variables (Project → Settings → Environment Variables):
   - `SITE_URL` — your production URL.
   - `NEWSLETTER_PROVIDER` — `stub` for now.
   - `BEEHIIV_API_KEY` / `BEEHIIV_PUBLICATION_ID` (or the matching ConvertKit / Buttondown vars) when ready.
   - Keystatic GitHub App vars when Jane should edit on a deployed preview: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
5. Deploy. The first build runs `pnpm build` (which is `astro build && pagefind --site .vercel/output/static`) and Vercel routes everything via the adapter.

Do not attach morningstacks.com in Vercel as part of this increment. Canonical URLs may already point at that host; leave them.

`@astrojs/vercel` outputs prerendered HTML to the static asset CDN and turns `/api/subscribe` and `/keystatic` (any route with `prerender = false`) into Vercel Serverless Functions. OG images are prerendered at build time, so they're served as cached static PNGs unless Kinjal uploads a 1200×630 file into the article OG slot.

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

Tokens, type scale, and component patterns mirror the brand book at `brand/morningstacks_voice_and_tone.html`. CSS tokens live in `src/styles/tokens.css` (Tailwind v4 `@theme` block). Don't fork the tokens. Edit them in the `@theme` block and they propagate as Tailwind utilities everywhere.
