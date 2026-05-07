import rss from '@astrojs/rss';
import { getCollection, getEntry } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '~/lib/seo';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const items = await Promise.all(
    articles.map(async (entry) => {
      const cat = await getEntry(entry.data.category);
      const slug = entry.id.replace(/\.mdx?$/, '').replace(/^[^/]+\//, '');
      return {
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.date,
        link: `/${cat?.data.slug ?? 'productivity'}/${slug}/`,
        categories: [cat?.data.name ?? entry.data.eyebrow],
      };
    }),
  );

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: items.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
    customData: '<language>en-us</language>',
    stylesheet: false,
  });
}
