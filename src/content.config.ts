import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const visibility = z.enum(['draft', 'unlisted', 'published']).default('draft');

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      type: z.enum(['article', 'review', 'roundup']).default('article'),
      title: z.string().min(8).max(120),
      description: z.string().min(80).max(220),
      answer: z
        .string()
        .optional()
        .refine(
          (value) => {
            if (!value) return true;
            const words = value.trim().split(/\s+/).filter(Boolean).length;
            return words >= 40 && words <= 80;
          },
          { message: 'Opening answer must be 40 to 80 words' },
        ),
      eyebrow: z.string(),
      category: reference('categories'),
      author: reference('authors'),
      date: z.coerce.date(),
      updated: z.coerce.date().nullish(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      og: image().optional(),
      ogAlt: z.string().optional(),
      ogTitle: z.string().max(80).optional(),
      products: z.array(reference('products')).default([]),
      rating: z.number().min(0).max(5).nullish(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      sources: z
        .array(
          z.object({
            title: z.string(),
            url: z.string().url().optional(),
            checked: z.coerce.date(),
          }),
        )
        .default([]),
      related: z.array(reference('articles')).default([]),
      featured: z.boolean().default(false),
      seed: z.boolean().default(false),
      template: z.boolean().default(false),
      status: visibility,
      draft: z.boolean().default(false),
      unlisted: z.boolean().default(false),
    }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,yaml,yml}', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    vendor: z.string(),
    category: reference('categories'),
    summary: z.string().min(30).max(200),
    price: z.string(),
    pricingModel: z.enum(['free', 'freemium', 'subscription', 'one-time']),
    ourVerdict: z.string(),
    pros: z.array(z.string()).min(1),
    cons: z.array(z.string()).min(1),
    rating: z.number().min(0).max(5),
    affiliateUrl: z.string().url(),
    websiteUrl: z.string().url().optional(),
    lastTested: z.coerce.date(),
    placeholder: z.boolean().default(false),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,yaml,yml}', base: './src/content/categories' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string(),
      hero: image().optional(),
      order: z.number().default(0),
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,yaml,yml}', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string().optional(),
      bio: z.string(),
      avatar: image().optional(),
      links: z
        .object({
          twitter: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          site: z.string().url().optional(),
          email: z.string().email().optional(),
        })
        .default({}),
    }),
});

export const collections = { articles, products, categories, authors };
