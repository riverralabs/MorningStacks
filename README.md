# MorningStacks

> The software stack for operators and founders. Sourced operator briefings and comparisons, clearly labeled.

Built with **Next.js App Router + MDX + Tailwind v4**. Deploys to **Vercel**. Jane edits in **Keystatic** (`/keystatic`), which commits MDX back to this repo. No separate CMS vendor.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000  ·  admin: http://127.0.0.1:3000/keystatic
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm check:content # fail if a published piece is missing required fields
pnpm test:content # publish-gate, affiliate, and newsletter unit checks
pnpm check:links http://127.0.0.1:3000 --external # crawl a running server for broken links
pnpm build        # next build + pagefind index
pnpm start        # serve the production build
```

Requires Node 22+ and pnpm 10+.

## What's here

| Path | Purpose |
| --- | --- |
| `src/content/` | Articles (MDX), products, categories, authors. Schema in `keystatic.config.ts` |
| `keystatic.config.ts` | Git-backed admin mapped onto those same collections |
| `src/app/` | App Router pages, sitemap, RSS, llms.txt, subscribe, Keystatic |
| `src/components/site/` | Disclosure strip, masthead, section nav, footer, 404 body |
| `src/components/stories/` | Story items, module heads, page heads, policy page layout |
| `src/components/newsletter/` | Monday letter band and panel, validated sign-up form |
| `src/components/mdx/` | React MDX blocks (Callout, ProductCard, Verdict, and the rest) |
| `src/lib/seo.ts`, `src/lib/schema.ts` | SEO helpers + typed JSON-LD builders (`schema-dts`) |
| `src/lib/publish.ts` | Draft / unlisted / published / seed visibility |
| `src/lib/content-model.ts` | Four article types and publish-gate rules |
| `src/lib/newsletter.ts` | Provider-agnostic subscribe interface (stub / beehiiv / convertkit / buttondown) |
| `src/lib/og.ts` + `src/app/og/` | 1200×630 OG cards, or the uploaded PNG when one exists |
| `src/app/llms.txt/route.ts` | AEO/GEO file for assistants; lists published articles only |
| `src/app/rss.xml/route.ts` | RSS feed (published only) |
| `src/lib/sitemap.ts` | Sitemap filter + article `lastmod` map |
| `src/app/fonts/` | Self-hosted Schibsted Grotesk and Source Serif 4 woff2 (Latin subset), loaded with `next/font/local` |
| `src/assets/fonts/` | Schibsted Grotesk TTFs for the social card renderer (Satori) only |
| `public/brand/` | The M badge and the outlined MorningStacks wordmark (kept from v1) |
| `brand/` | Brand book v1.1 reference. Source of truth for tokens and patterns |

## Authoring articles

Jane should prefer Keystatic at `/keystatic` (local filesystem in `pnpm dev`; GitHub mode on Vercel when the Keystatic GitHub App env vars are set). Articles still live in `src/content/articles/*.mdx`. The schema is `keystatic.config.ts`.

Visibility:

| `status` | What happens |
| --- | --- |
| `draft` | Not built. Not on the live domain. Not in RSS, sitemap, home, or sections. |
| `unlisted` | Built for preview. `noindex`. Kept out of RSS, sitemap, home, and sections. |
| `published` | Live, listed, indexed. |

`seed: true` is a hold flag for leftover placeholder articles. Seed entries stay off the live domain even if someone flips visibility. `template: true` is the same hold for skeleton files. Neither may be published.

Every MDX is exactly one type: `review` | `roundup` | `briefing` | `explainer`. Loose `article` is deprecated. Published pieces need `answer` (40–80 words), at least one `source`, and `author`. Reviews also need `products` plus `lastTested` or `testMethod`. Disclosure renders whenever products, ProductCards, AffiliateLinks, or sponsored links are present, not only on reviews.

```mdx
---
type: review              # review | roundup | briefing | explainer
status: draft             # draft | unlisted | published
title: Linear review
description: 80–220 chars, used as meta description and OG description.
answer: 40 to 80 words. Required to publish.
eyebrow: Sourced review
category: productivity    # references src/content/categories/*.md slug
author: dipen             # required
date: 2026-04-25
updated: 2026-04-30
products:
  - linear                # required for review
lastTested: 2026-04-30
sources:
  - title: Linear pricing
    url: https://linear.app/pricing
    checked: 2026-04-30
faq:
  - q: Is Linear better than Jira?
    a: ...
related: []
---

<ProductCard product="linear" /> embeds a product card.
<AffiliateLink product="linear">Try Linear</AffiliateLink> is an explicit paid link.
<PullQuote cite="...">...</PullQuote>
<Callout tone="info" title="...">...</Callout>
<ComparisonTable> wrap a markdown table </ComparisonTable>
```

Reviews emit `Review` JSON-LD. FAQ pairs emit `FAQPage` JSON-LD. `pnpm check:content` fails the build if a published piece is missing required fields.

A product stores the real program URL in `affiliateUrl` and the public site in `websiteUrl`. `program` is `direct`, `rewardful`, `partnerstack`, `impact`, or `other`. `status` is `none`, `applied`, or `active`. Only `active` renders a paid link, and only through `/go/{slug}/`, which redirects to the stored URL. A network URL is not rewritten. `?via=morningstacks` is a fallback for a vendor URL that has no affiliate parameters, and it cannot be `active`. `commissionNote` stays in the file and is not rendered. Until a program is active, a product card links to `websiteUrl` without `rel="sponsored"`.

## Newsletter

The form posts to `/api/subscribe`, which calls `src/lib/newsletter.ts`. The current provider is selected via the `NEWSLETTER_PROVIDER` env var (`stub` | `beehiiv` | `convertkit` | `buttondown`). The stub logs and returns success. Swap providers by setting the env var and the matching API key (see `.env.example`). The form contract and UI never change.

## Deploy. Vercel

1. Push to GitHub.
2. Vercel dashboard → Add New → Project → Import the repo.
3. Framework preset: **Next.js**. Build command is `pnpm build`.
4. Set environment variables (Project → Settings → Environment Variables):
   - `SITE_URL` — `https://www.morningstacks.com` (canonical production host). Apex `https://morningstacks.com` is rewritten to www at build time.
   - `NEWSLETTER_PROVIDER` — `stub` for now.
   - `BEEHIIV_API_KEY` / `BEEHIIV_PUBLICATION_ID` (or the matching ConvertKit / Buttondown vars) when ready.
   - Keystatic GitHub App vars when Jane should edit on a deployed preview: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (or `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`).
5. Deploy. `pnpm build` runs `next build`, then Pagefind writes the search index into `.next/static/pagefind`.

Canonical host is `https://www.morningstacks.com`. Apex requests 301 to www via `vercel.json`. Keep both hosts attached in Vercel so the redirect can fire. HTML URLs use a trailing slash (`/about/`, `/ai-tools/slug/`). Middleware 308s bare HTML paths. `/api/` and `/keystatic` are left alone so POST bodies survive. Article social cards are drawn at `/og/{category}/{slug}.png` from the OG title line, with the section and format as a label. An upload in `src/assets/og/{slug}/og.png` replaces the drawn card.

### Google indexing

The build emits `sitemap-index.xml` + `sitemap-0.xml`. `/sitemap.xml` 308s to the index so a Search Console paste still works. `robots.txt` already lists the index. Article `<loc>` entries include `lastmod` from `updated` or `date`. Search, Keystatic, API, OG images, and `/affiliate-disclosure/` (canonicalized to `/disclosure/`) stay out of the sitemap.

Google Search Console verification file: `public/google044d8d30cc3be5fb.html`. Keep it. After a production Promote:

1. Search Console → Sitemaps → submit `https://www.morningstacks.com/sitemap-index.xml` once (Google refetches on its own after that).
2. URL Inspection → Request indexing on the homepage and each new article URL, using the trailing-slash www form that matches the canonical tag.
3. Watch the Pages report. A slash mismatch between sitemap `<loc>` and `rel=canonical` is the usual “duplicate / page with redirect” trap; both now use the slashed URL.

Google ignores sitemap `priority` and `changefreq`, so we do not set them. Preview deploys (`VERCEL_ENV=preview`) send `noindex`.

### Local preview

```bash
pnpm build && pnpm preview
```

`pnpm dev` is enough for everyday work. `pnpm build && pnpm start` serves the production build.

## Lint, typecheck, build before every commit

CI (`.github/workflows/ci.yml`) runs lint, typecheck, content gates, and build on every PR. Locally:

```bash
pnpm lint && pnpm typecheck && pnpm test:content && pnpm test:seo && pnpm check:content && pnpm build && pnpm check:sitemap
```

## Brand

Voice and tone follow `brand/morningstacks_voice_and_tone.html`. The visual identity (v2) keeps the M badge and wordmark, and sets ink `#1C1916` and navy `#1E3A5F` on warm white, Schibsted Grotesk for headlines and interface, and Source Serif 4 for reading. Structure comes from rules and a 12-column grid rather than shadows, gradients, or icons. CSS tokens live in `src/app/globals.css` (Tailwind v4 `@theme` block). Don't fork the tokens. Edit them in the `@theme` block and they propagate as Tailwind utilities everywhere.
