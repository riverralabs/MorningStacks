/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
  readonly NEWSLETTER_PROVIDER: 'stub' | 'beehiiv' | 'convertkit' | 'buttondown';
  readonly BEEHIIV_API_KEY?: string;
  readonly BEEHIIV_PUBLICATION_ID?: string;
  readonly CONVERTKIT_API_KEY?: string;
  readonly CONVERTKIT_FORM_ID?: string;
  readonly BUTTONDOWN_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
