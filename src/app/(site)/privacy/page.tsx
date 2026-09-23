import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage } from '~/components/stories/DocPage';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description:
    'What MorningStacks collects (very little), why there is no cookie banner, how email and affiliate links work, and how to ask us to delete your data.',
  path: '/privacy/',
  ogSlug: 'privacy',
});

export default function PrivacyPage() {
  return (
    <DocPage
      path="/privacy/"
      title="Privacy policy"
      summary="We collect as little as we can. No analytics, no advertising pixels, and no cookies on reader pages."
      updated="Last updated September 2026. Draft. Not legal advice."
    >
      <p>
        This is a working draft for an affiliate publication. It is not legal advice. Questions go to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>Who we are</h2>
      <p>
        MorningStacks is an independent publication. The publisher is {SITE.publisher}. The contact address for this
        policy is {SITE.email}.
      </p>
      <h2>What we collect</h2>
      <p>
        If you email us, we receive the address you send from, the message, and any files you attach. We use that to
        reply, correct a piece, or consider a pitch. We do not sell that information.
      </p>
      <p>
        The newsletter sign-up is not connected to an email service yet. Until it is, joining means emailing{' '}
        {SITE.email}, and your address stays in our inbox. When a provider is connected, this page will name it before
        any address is collected through the form.
      </p>
      <h2>Cookies</h2>
      <p>
        Reader pages on MorningStacks do not set cookies. We do not run analytics, advertising pixels, or tracking
        scripts, and our fonts and search index are served from our own domain. That is why there is no cookie banner:
        there is nothing to consent to.
      </p>
      <p>
        The editor sign-in at <code>/keystatic</code> uses cookies to keep staff signed in. Readers never reach it. If
        we ever add analytics or advertising, we will ask for your consent before it runs and update this page first.
      </p>
      <h2>Hosting and security</h2>
      <p>
        The site is hosted by Vercel and served only over HTTPS. To deliver pages and protect the site from abuse,
        Vercel processes technical request data such as your IP address and browser type. The sign-up form checks your
        IP address in memory to slow down repeated automated submissions. We do not store it.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Some buttons go to <code>/go/</code> and then to a vendor. We do not add an advertising pixel on that redirect.
        The vendor or its affiliate network may know you arrived from MorningStacks, and may set its own cookies once
        you are on its site. What they collect is governed by their policies. See the{' '}
        <Link href="/disclosure/">affiliate disclosure</Link>.
      </p>
      <h2>How long we keep email</h2>
      <p>
        We keep editorial email as long as it is needed to run the publication: corrections, pitches, and ongoing
        correspondence. You can ask us to delete a message you sent by writing to {SITE.email}.
      </p>
      <h2>Your requests</h2>
      <p>
        To ask what we hold about you, or to ask us to delete an email you sent, write to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We do not operate a phone line for these requests.
      </p>
    </DocPage>
  );
}
