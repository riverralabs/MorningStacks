import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  featuredPublishedCount,
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

test('disclosure fires for products, sponsored links, or ProductCard', () => {
  assert.equal(shouldShowDisclosure({ products: ['linear'] }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: '<a rel="sponsored" href="#">' }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: '<ProductCard product="linear" />' }), true);
  assert.equal(shouldShowDisclosure({ products: [], body: 'No commerce links.' }), false);
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
