import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanSource, isNewsletterLive, isValidEmail, looksAutomated, MIN_FILL_MS } from '../src/lib/newsletter.ts';

test('email validation', () => {
  assert.equal(isValidEmail('jane@example.com'), true);
  assert.equal(isValidEmail('jane@example'), false);
  assert.equal(isValidEmail('jane@example.c'), false);
  assert.equal(isValidEmail('jane example@example.com'), false);
  assert.equal(isValidEmail(`${'a'.repeat(250)}@example.com`), false);
});

test('honeypot and fill time mark a submission as automated', () => {
  const now = 1_000_000;
  assert.equal(looksAutomated({ honeypot: 'https://spam.example', startedAt: '', now }), true);
  assert.equal(looksAutomated({ honeypot: '', startedAt: String(now - 500), now }), true);
  assert.equal(looksAutomated({ honeypot: '', startedAt: String(now - MIN_FILL_MS - 1), now }), false);
  assert.equal(looksAutomated({ honeypot: '', startedAt: '', now }), false);
  assert.equal(looksAutomated({ honeypot: '', startedAt: 'not-a-number', now }), false);
});

test('source is limited to a short slug', () => {
  assert.equal(cleanSource('article-cursor-vs-claude-code-2026'), 'article-cursor-vs-claude-code-2026');
  assert.equal(cleanSource('<script>'), 'site');
  assert.equal(cleanSource(undefined), 'site');
});

test('the stub provider does not count as a live list', () => {
  assert.equal(isNewsletterLive(undefined), false);
  assert.equal(isNewsletterLive('stub'), false);
  assert.equal(isNewsletterLive('beehiiv'), true);
});
