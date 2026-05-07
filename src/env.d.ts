/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEWSLETTER_PROVIDER?: 'stub' | 'beehiiv' | 'convertkit' | 'buttondown';
    BEEHIIV_API_KEY?: string;
    BEEHIIV_PUBLICATION_ID?: string;
    CONVERTKIT_API_KEY?: string;
    CONVERTKIT_FORM_ID?: string;
    BUTTONDOWN_API_KEY?: string;
  }
}
