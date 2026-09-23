import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  featuredPublishedCount,
  imageAltErrors,
  publishGateErrors,
  shouldShowDisclosure,
  wordCount,
} from '../src/lib/content-model.ts';

test('published piece missing answer and sources fails', () => {
  const errors = publishGateErrors({
    type: 'explainer',
    status: 'published',
    seed: false,
    title: 'A long enough title',
    description: 'x'.repeat(90),
    eyebrow: 'Sourced explainer',
    category: 'ai-tools',
    author: 'dipen',
    date: '2026-09-16',
    answer: '',
    sources: [],
    products: [],
  });
  assert.deepEqual(
    errors.map((error) => error.path),
    ['answer', 'sources'],
  );
});

test('draft review without products fails even off-live', () => {
  const errors = publishGateErrors({
    type: 'review',
    status: 'draft',
    seed: true,
    products: [],
  });
  assert.equal(errors.some((error) => error.path === 'products'), true);
});

test('seed cannot be published', () => {
  const errors = publishGateErrors({
    type: 'explainer',
    status: 'published',
    seed: true,
    answer: 'word '.repeat(45).trim(),
    sources: [{ title: 'Docs' }],
    products: [],
  });
  assert.equal(errors.some((error) => error.path === 'seed'), true);
});

test('legacy article type is rejected', () => {
  const errors = publishGateErrors({
    type: 'article',
    status: 'draft',
  });
  assert.equal(errors[0]?.path, 'type');
});

test('disclosure fires for products, sponsored links, ProductCard, or AffiliateLink', () => {
  assert.equal(shouldShowDisclosure({ products: ['linear'] }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: '<a rel="sponsored" href="#">' }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: '<ProductCard product="linear" />' }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: '<AffiliateLink product="linear">Try</AffiliateLink>' }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: 'No commerce links.' }), false);
});

const liveAnswer = `${'word '.repeat(50).trim()}`;

test('live review may name an inactive product when the body does not promote it', () => {
  const errors = publishGateErrors({
    type: 'review',
    status: 'published',
    seed: false,
    answer: liveAnswer,
    sources: [{ title: 'Docs' }],
    products: ['linear'],
    lastTested: '2026-04-30',
    body: 'The review names the tool in frontmatter only.',
    catalog: [{ slug: 'linear', programStatus: 'none', affiliateUrl: 'https://linear.app/?via=morningstacks' }],
  });
  assert.equal(errors.some((error) => error.path === 'products'), false);
});

test('live roundup fails when it promotes a product that is not an active program', () => {
  const errors = publishGateErrors({
    type: 'roundup',
    status: 'published',
    seed: false,
    answer: liveAnswer,
    sources: [{ title: 'Docs' }],
    products: ['raycast'],
    body: '<ProductCard product="raycast" />',
    catalog: [{ slug: 'raycast', programStatus: 'applied', affiliateUrl: 'https://www.raycast.com/?via=morningstacks' }],
  });
  assert.equal(errors.some((error) => error.message.includes('raycast')), true);
});

test('active program still on the morningstacks placeholder fails', () => {
  const errors = publishGateErrors({
    type: 'review',
    status: 'published',
    seed: false,
    answer: liveAnswer,
    sources: [{ title: 'Docs' }],
    products: ['linear'],
    lastTested: '2026-04-30',
    body: 'No card in the body.',
    catalog: [{ slug: 'linear', programStatus: 'active', affiliateUrl: 'https://linear.app/?via=morningstacks' }],
  });
  assert.equal(errors.some((error) => error.path === 'affiliateUrl'), true);
});

test('briefing may mention a tool without a product card', () => {
  const errors = publishGateErrors({
    type: 'briefing',
    status: 'published',
    seed: false,
    answer: liveAnswer,
    sources: [{ title: 'Docs' }],
    products: [],
    body: 'Linear is mentioned in prose, with a citation, not a card.',
    catalog: [{ slug: 'linear', programStatus: 'none', affiliateUrl: 'https://linear.app/?via=morningstacks' }],
  });
  assert.equal(errors.some((error) => error.path === 'products' || error.path === 'affiliateUrl'), false);
});

test('featured max 1 counts only live published pieces', () => {
  const count = featuredPublishedCount([
    { featured: true, status: 'published', seed: false },
    { featured: true, status: 'draft', seed: false },
    { featured: true, status: 'published', seed: true },
  ]);
  assert.equal(count, 1);
});

test('answer word count is 40 to 80 for publish', () => {
  assert.equal(wordCount('one two three'), 3);
  const short = publishGateErrors({
    type: 'briefing',
    status: 'published',
    answer: 'word '.repeat(20).trim(),
    sources: [{ title: 'Docs' }],
    products: [],
  });
  assert.equal(short.some((error) => error.path === 'answer'), true);
});

test('images without alt text fail', () => {
  assert.deepEqual(imageAltErrors({ hero: '../hero.png', heroAlt: '' }).map((error) => error.path), ['heroAlt']);
  assert.equal(imageAltErrors({ hero: '../hero.png', heroAlt: 'Cursor pricing page' }).length, 0);
  const body = [
    '<Figure src={pricing} alt="" />',
    '<Figure src={checklist} alt="Five-step checklist" caption="Checklist" />',
    '![](chart.png)',
    '![Plan comparison chart](chart.png)',
    '<img src="/x.png">',
  ].join('\n');
  assert.deepEqual(
    imageAltErrors({ body }).map((error) => error.message),
    ['Figure needs a non-empty alt', 'Markdown image needs alt text', 'img tag needs alt text'],
  );
});
