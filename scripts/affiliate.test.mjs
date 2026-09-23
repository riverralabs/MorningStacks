import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  hasAffiliateParameters,
  isActiveProgram,
  isPlaceholderAffiliateUrl,
  withAffiliateVia,
} from '../src/lib/affiliate.ts';
import { productProgramErrors } from '../src/lib/content-model.ts';

test('a network URL is not rewritten', () => {
  const impact = 'https://linear.app/?irclickid=abc123';
  assert.equal(hasAffiliateParameters(impact), true);
  assert.equal(withAffiliateVia(impact), impact);
  const rewardful = 'https://www.raycast.com/?via=jane';
  assert.equal(withAffiliateVia(rewardful), rewardful);
  assert.equal(isPlaceholderAffiliateUrl(rewardful), false);
});

test('a plain vendor URL gets the fallback query', () => {
  assert.equal(withAffiliateVia('https://linear.app/'), 'https://linear.app/?via=morningstacks');
  assert.equal(isPlaceholderAffiliateUrl('https://linear.app/?via=morningstacks'), true);
});

test('an existing ref is left alone', () => {
  const raw = 'https://example.com/?ref=partner';
  assert.equal(withAffiliateVia(raw), raw);
});

test('only an active non-placeholder program is paid', () => {
  assert.equal(
    isActiveProgram({
      programStatus: 'active',
      affiliateUrl: 'https://linear.app/?irclickid=abc',
    }),
    true,
  );
  assert.equal(
    isActiveProgram({
      programStatus: 'active',
      affiliateUrl: 'https://linear.app/?via=morningstacks',
    }),
    false,
  );
  assert.equal(
    isActiveProgram({
      programStatus: 'none',
      affiliateUrl: 'https://linear.app/?irclickid=abc',
    }),
    false,
  );
});

test('product files cannot be active on the placeholder URL', () => {
  const errors = productProgramErrors({
    status: 'active',
    program: 'direct',
    affiliateUrl: 'https://linear.app/?via=morningstacks',
  });
  assert.equal(errors.some((error) => error.path === 'affiliateUrl'), true);
  assert.equal(
    productProgramErrors({
      status: 'none',
      program: 'direct',
      affiliateUrl: 'https://linear.app/?via=morningstacks',
    }).length,
    0,
  );
});
