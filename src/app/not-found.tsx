import type { Metadata } from 'next';
import { NotFoundBody } from '~/components/site/NotFoundBody';
import { SiteFrame } from '~/components/site/SiteFrame';
import { pageMetadata } from '~/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Page not found',
  description: 'That link did not lead to a MorningStacks page. Browse the archive or search every published piece.',
  path: '/404/',
  noindex: true,
});

export default function NotFound() {
  return (
    <SiteFrame>
      <NotFoundBody />
    </SiteFrame>
  );
}
