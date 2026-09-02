import { config, fields, collection } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

const githubConfigured = Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID);
const onVercel = Boolean(process.env.VERCEL);

const storage = githubConfigured || onVercel
  ? {
      kind: 'github' as const,
      repo: { owner: 'riverralabs', name: 'MorningStacks' },
      branchPrefix: 'content/',
    }
  : { kind: 'local' as const };

const articleBody = fields.mdx({
  label: 'Body',
  description:
    'MDX. Use the insert menu for Callout, ProductCard, PullQuote, ProsCons, Verdict, Disclosure, and ComparisonTable. Do not paste raw HTML. Do not invent first-person tests.',
  options: {
    image: {
      directory: 'src/assets/articles/{slug}',
      publicPath: '../../assets/articles/{slug}/',
    },
  },
  components: {
    Callout: wrapper({
      label: 'Callout',
      schema: {
        tone: fields.select({
          label: 'Tone',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Good', value: 'good' },
            { label: 'Warn', value: 'warn' },
            { label: 'Bad', value: 'bad' },
          ],
          defaultValue: 'info',
        }),
        title: fields.text({ label: 'Title' }),
      },
    }),
    ProductCard: block({
      label: 'Product card',
      schema: {
        product: fields.relationship({
          label: 'Product',
          collection: 'products',
          validation: { isRequired: true },
        }),
      },
    }),
    PullQuote: wrapper({
      label: 'Pull quote',
      schema: {
        cite: fields.text({ label: 'Cite' }),
      },
    }),
    ProsCons: block({
      label: 'Pros and cons',
      schema: {
        title: fields.text({ label: 'Title' }),
        pros: fields.array(fields.text({ label: 'Pro' }), {
          label: 'Pros',
          itemLabel: (props) => props.value || 'Pro',
        }),
        cons: fields.array(fields.text({ label: 'Con' }), {
          label: 'Cons',
          itemLabel: (props) => props.value || 'Con',
        }),
      },
    }),
    Verdict: wrapper({
      label: 'Verdict',
      schema: {
        label: fields.text({ label: 'Label', defaultValue: 'Verdict' }),
      },
    }),
    Disclosure: block({
      label: 'Affiliate disclosure',
      schema: {},
    }),
    ComparisonTable: wrapper({
      label: 'Comparison table',
      description: 'Wrap a markdown table. Good/bad/warn colors belong in comparison tables only.',
      schema: {},
    }),
  },
});

export default config({
  storage,
  ui: {
    brand: { name: 'MorningStacks' },
    navigation: {
      Writing: ['articles', 'products'],
      Site: ['categories', 'authors'],
    },
  },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'body' },
      columns: ['status', 'type', 'date'],
      previewUrl: '/{category}/{slug}/',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { length: { min: 8, max: 80 } },
          },
        }),
        status: fields.select({
          label: 'Visibility',
          description:
            'Draft is not built. Unlisted is built, noindexed, and kept out of nav, RSS, and the sitemap. Published is live. Seed placeholders stay off the live domain until Seed is unchecked and this is Published.',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Unlisted', value: 'unlisted' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        type: fields.select({
          label: 'Type',
          options: [
            { label: 'Article', value: 'article' },
            { label: 'Review', value: 'review' },
            { label: 'Roundup', value: 'roundup' },
          ],
          defaultValue: 'article',
        }),
        description: fields.text({
          label: 'Description',
          multiline: true,
          description: '80 to 220 characters. Meta description only.',
          validation: { length: { min: 80, max: 220 } },
        }),
        answer: fields.text({
          label: 'Opening answer (40-80 words)',
          multiline: true,
          description:
            'The first paragraph under the H1. Jane writes this. Do not invent a first-person test. Leave empty on the template.',
        }),
        eyebrow: fields.text({ label: 'Eyebrow' }),
        category: fields.relationship({
          label: 'Category',
          collection: 'categories',
          validation: { isRequired: true },
        }),
        author: fields.relationship({
          label: 'Author',
          collection: 'authors',
          validation: { isRequired: true },
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        updated: fields.date({ label: 'Updated' }),
        hero: fields.image({
          label: 'Hero image',
          directory: 'src/assets/heroes/{slug}',
          publicPath: '../../assets/heroes/{slug}/',
        }),
        heroAlt: fields.text({ label: 'Hero alt text' }),
        og: fields.image({
          label: 'OG image (1200 x 630)',
          description:
            'Kinjal fills this 1200 by 630 slot after Jane\'s draft. Cream field, Lora wordmark, Lora title, ink-blue rule. No logos. No prices.',
          directory: 'src/assets/og/{slug}',
          publicPath: '../../assets/og/{slug}/',
        }),
        ogAlt: fields.text({ label: 'OG alt text' }),
        products: fields.multiRelationship({
          label: 'Products',
          collection: 'products',
        }),
        rating: fields.number({
          label: 'Rating',
          description: '0 to 5, reviews only.',
          step: 0.1,
          validation: { min: 0, max: 5 },
        }),
        faq: fields.array(
          fields.object({
            q: fields.text({ label: 'Question', validation: { isRequired: true } }),
            a: fields.text({ label: 'Answer', multiline: true, validation: { isRequired: true } }),
          }),
          {
            label: 'FAQ',
            description: 'Each pair is emitted as FAQPage JSON-LD.',
            itemLabel: (props) => props.fields.q.value || 'Question',
          },
        ),
        related: fields.multiRelationship({
          label: 'Related articles',
          collection: 'articles',
        }),
        featured: fields.checkbox({ label: 'Featured on the home page' }),
        seed: fields.checkbox({
          label: 'Seed placeholder',
          description:
            'Held leftover content. Stays off the live domain until this is unchecked and visibility is Published. Do not delete without clearing this flag on purpose.',
        }),
        template: fields.checkbox({
          label: 'Jane article template',
          description: 'Skeleton only. Do not publish until the verified draft lands.',
        }),
        body: articleBody,
      },
    }),
    products: collection({
      label: 'Products',
      slugField: 'name',
      path: 'src/content/products/*',
      format: { contentField: 'body' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        vendor: fields.text({ label: 'Vendor', validation: { isRequired: true } }),
        category: fields.relationship({
          label: 'Category',
          collection: 'categories',
          validation: { isRequired: true },
        }),
        summary: fields.text({
          label: 'Summary',
          multiline: true,
          validation: { length: { min: 30, max: 200 } },
        }),
        price: fields.text({ label: 'Price', validation: { isRequired: true } }),
        pricingModel: fields.select({
          label: 'Pricing model',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Freemium', value: 'freemium' },
            { label: 'Subscription', value: 'subscription' },
            { label: 'One-time', value: 'one-time' },
          ],
          defaultValue: 'subscription',
        }),
        ourVerdict: fields.text({ label: 'Our verdict', multiline: true, validation: { isRequired: true } }),
        pros: fields.array(fields.text({ label: 'Pro' }), {
          label: 'Pros',
          itemLabel: (props) => props.value || 'Pro',
          validation: { length: { min: 1 } },
        }),
        cons: fields.array(fields.text({ label: 'Con' }), {
          label: 'Cons',
          itemLabel: (props) => props.value || 'Con',
          validation: { length: { min: 1 } },
        }),
        rating: fields.number({
          label: 'Rating',
          step: 0.1,
          validation: { isRequired: true, min: 0, max: 5 },
        }),
        affiliateUrl: fields.url({
          label: 'Affiliate URL',
          description: 'Use ?via=morningstacks as the placeholder query. Do not mix via=morning-stacks.',
          validation: { isRequired: true },
        }),
        websiteUrl: fields.url({ label: 'Website URL' }),
        lastTested: fields.date({ label: 'Last tested', validation: { isRequired: true } }),
        placeholder: fields.checkbox({
          label: 'Placeholder product',
          description: 'Not a tested review. Jane fills this when the verified draft lands.',
        }),
        body: fields.mdx({
          label: 'Notes',
          extension: 'md',
          description: 'Optional editor notes. Not shown on the site.',
        }),
      },
    }),
    categories: collection({
      label: 'Categories',
      slugField: 'name',
      path: 'src/content/categories/*',
      format: { contentField: 'body' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        slug: fields.text({
          label: 'URL slug',
          description: 'Must match the public section path, e.g. ai-tools.',
          validation: { isRequired: true },
        }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        body: fields.mdx({ label: 'Notes', extension: 'md' }),
      },
    }),
    authors: collection({
      label: 'Authors',
      slugField: 'name',
      path: 'src/content/authors/*',
      format: { contentField: 'body' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        role: fields.text({ label: 'Role' }),
        bio: fields.text({ label: 'Bio', multiline: true, validation: { isRequired: true } }),
        links: fields.object({
          twitter: fields.url({ label: 'Twitter' }),
          linkedin: fields.url({ label: 'LinkedIn' }),
          site: fields.url({ label: 'Site' }),
          email: fields.text({ label: 'Email' }),
        }),
        body: fields.mdx({ label: 'Notes', extension: 'md' }),
      },
    }),
  },
});
