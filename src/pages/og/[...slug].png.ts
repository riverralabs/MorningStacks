import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { renderOg } from '~/lib/og';
import { SITE } from '~/lib/seo';

export const prerender = true;

export async function getStaticPaths() {
  const entries: { params: { slug: string }; props: { eyebrow?: string; title: string; description?: string; badge?: string } }[] = [];

  // Default OG card
  entries.push({
    params: { slug: 'default' },
    props: {
      title: 'Software we’d renew tomorrow.',
      description: SITE.tagline,
      eyebrow: 'MorningStacks',
    },
  });

  // Static pages
  const staticPages: { slug: string; title: string; eyebrow: string; description: string }[] = [
    { slug: 'about', eyebrow: 'About', title: 'About MorningStacks', description: 'Editorial first, commerce second.' },
    { slug: 'methodology', eyebrow: 'Methodology', title: 'How we test', description: '30 days, real teams, real money.' },
    { slug: 'disclosure', eyebrow: 'Disclosure', title: 'Affiliate disclosure', description: 'How affiliate links work — and what they don’t influence.' },
    { slug: 'contact', eyebrow: 'Contact', title: 'Pitch us. Tip us. Correct us.', description: 'We read every email.' },
    { slug: 'newsletter', eyebrow: 'Newsletter', title: 'Monday morning, in your inbox.', description: 'Five-minute read. Operator-grade.' },
    { slug: 'search', eyebrow: 'Search', title: 'Search the archive', description: 'Find a tool, a roundup, an opinion.' },
  ];
  for (const p of staticPages) {
    entries.push({
      params: { slug: p.slug },
      props: { title: p.title, eyebrow: p.eyebrow, description: p.description },
    });
  }

  // Categories
  const categories = await getCollection('categories');
  for (const c of categories) {
    entries.push({
      params: { slug: `category-${c.data.slug}` },
      props: { eyebrow: 'Section', title: c.data.name, description: c.data.description },
    });
  }

  // Articles
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  for (const a of articles) {
    const cat = await getEntry(a.data.category);
    const slug = a.id.replace(/\.mdx?$/, '').replace(/^[^/]+\//, '');
    entries.push({
      params: { slug: `${cat?.data.slug ?? 'productivity'}/${slug}` },
      props: {
        eyebrow: a.data.eyebrow,
        title: a.data.title,
        description: a.data.description,
        badge: a.data.type === 'review' ? 'Review' : a.data.type === 'roundup' ? 'Roundup' : 'Editorial',
      },
    });
  }

  return entries;
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as { title: string; eyebrow?: string; description?: string; badge?: string });
  return new Response(png, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
};
