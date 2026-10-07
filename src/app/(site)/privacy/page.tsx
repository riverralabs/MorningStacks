import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage } from '~/components/stories/DocPage';
import { pageMetadata } from '~/lib/metadata';
import { SITE } from '~/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description:
    'What MorningStacks collects, how Google AdSense uses cookies including the DoubleClick cookie, how to opt out of personalized ads, and how to email us.',
  path: '/privacy/',
  ogSlug: 'privacy',
});

export default function PrivacyPage() {
  return (
    <DocPage
      path="/privacy/"
      title="Privacy policy"
      summary="What we collect, how Google AdSense uses advertising cookies, and how to reach us."
      updated="Last updated October 7, 2026."
    >
      <p>
        MorningStacks is published by {SITE.publisher}. This policy describes what we collect and
        how advertising on the site works. Questions go to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
      <h2>Who we are</h2>
      <p>
        MorningStacks is an independent publication. The operator is {SITE.publisher}. The contact
        address for this policy is {SITE.email}.
      </p>
      <h2>What we collect</h2>
      <p>
        If you email us, we receive the address you send from, the message, and any files you
        attach. We use that to reply, correct a piece, or consider a pitch. We do not sell that
        information.
      </p>
      <p>
        There is no sign-up form on the site. If you email us about the Monday letter, we receive
        the address you write from and the message. We use that to reply. We do not sell that
        information.
      </p>
      <h2>Cookies and advertising</h2>
      <p>
        Reader pages do not set our own analytics cookies. We do not run a first-party analytics
        tool. Fonts and the search index are served from our own domain.
      </p>
      <p>
        We use Google AdSense to show advertisements on MorningStacks. The publisher ID is
        ca-pub-9447330391546137. Google is a third-party advertising vendor. Google uses cookies to
        serve ads on this site. Those cookies include the DoubleClick cookie (often stored under the
        name IDE). Google and its partners use them to serve and measure ads, including personalized
        ads based on your visits to this site and to other sites.
      </p>
      <p>
        Other third-party vendors may also set or read cookies on your browser, or use similar
        technologies, to show ads and to understand which ads were seen.
      </p>
      <p>
        Google describes this in{' '}
        <a href="https://policies.google.com/technologies/partner-sites">
          How Google uses data when you use our partners&apos; sites or apps
        </a>
        .
      </p>
      <p>
        You can opt out of personalized ads, and change the kinds of ads Google shows you, in{' '}
        <a href="https://adssettings.google.com">Google Ads Settings</a>.
      </p>
      <p>
        If you are in the European Economic Area, the United Kingdom, or Switzerland, consent is
        required before Google uses cookies or similar identifiers for personalized ads. You can
        accept or refuse that use. You can change the choice later in{' '}
        <a href="https://adssettings.google.com">Google Ads Settings</a>.
      </p>
      <p>
        The editor sign-in at <code>/keystatic</code> uses cookies to keep staff signed in. Readers
        do not use that page.
      </p>
      <h2>Hosting and security</h2>
      <p>
        The site is hosted by Vercel and served only over HTTPS. To deliver pages and protect the
        site from abuse, Vercel processes technical request data such as your IP address and browser
        type. We do not use that data to build our own advertising profile.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Some buttons go to <code>/go/</code> and then to a vendor. We do not add an advertising
        pixel on that redirect. The vendor or its affiliate network may know you arrived from
        MorningStacks, and may set its own cookies once you are on its site. What they collect is
        governed by their policies. See the <Link href="/disclosure/">affiliate disclosure</Link>.
        Display ads from Google AdSense are separate from these affiliate links.
      </p>
      <h2>How long we keep email</h2>
      <p>
        We keep editorial email as long as it is needed to run the publication: corrections,
        pitches, and ongoing correspondence. You can ask us to delete a message you sent by writing
        to {SITE.email}.
      </p>
      <h2>Your requests</h2>
      <p>
        To ask what we hold about you, or to ask us to delete an email you sent, write to{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We do not operate a phone line for these
        requests.
      </p>
    </DocPage>
  );
}
