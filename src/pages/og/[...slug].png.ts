import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { renderOg } from '~/lib/og';
import { articleSlug, isBuildable } from '~/lib/publish';

export const prerender = true;

export async function getStaticPaths() {
  const entries: { params: { slug: string }; props: { title: string } }[] = [];

  entries.push({
    params: { slug: 'default' },
    props: { title: "Software we'd renew tomorrow." },
  });

  entries.push({
    params: { slug: 'slot' },
    props: { title: 'Systeme.io vs ClickFunnels' },
  });

  const staticPages: { slug: string; title: string }[] = [
    { slug: 'about', title: 'About MorningStacks' },
    { slug: 'methodology', title: 'How we test' },
    { slug: 'disclosure', title: 'Affiliate disclosure' },
    { slug: 'contact', title: 'Contact MorningStacks' },
    { slug: 'newsletter', title: 'Monday morning, in your inbox.' },
    { slug: 'search', title: 'Search the archive' },
    { slug: 'privacy', title: 'Privacy Policy' },
    { slug: 'terms', title: 'Terms of Use' },
    { slug: 'archive', title: 'All writing' },
  ];
  for (const p of staticPages) {
    entries.push({ params: { slug: p.slug }, props: { title: p.title } });
  }

  const categories = await getCollection('categories');
  for (const c of categories) {
    entries.push({
      params: { slug: `category-${c.data.slug}` },
      props: { title: c.data.name },
    });
  }

  const articles = await getCollection('articles', ({ data }) => isBuildable(data));
  for (const a of articles) {
    const cat = await getEntry(a.data.category);
    const slug = articleSlug(a.id);
    entries.push({
      params: { slug: `${cat?.data.slug ?? 'productivity'}/${slug}` },
      props: { title: a.data.title },
    });
  }

  return entries;
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as { title: string });
  return new Response(png, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
};
