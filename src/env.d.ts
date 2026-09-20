/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SITE?: string;
  readonly SITE_URL?: string;
  readonly PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?: string;
  readonly VERCEL_ENV?: 'production' | 'preview' | 'development';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    SITE_URL?: string;
    VERCEL_ENV?: 'production' | 'preview' | 'development';
    NEWSLETTER_PROVIDER?: 'stub' | 'beehiiv' | 'convertkit' | 'buttondown';
    KEYSTATIC_GITHUB_CLIENT_ID?: string;
    KEYSTATIC_GITHUB_CLIENT_SECRET?: string;
    KEYSTATIC_SECRET?: string;
    PUBLIC_KEYSTATIC_GITHUB_APP_SLUG?: string;
    BEEHIIV_API_KEY?: string;
    BEEHIIV_PUBLICATION_ID?: string;
    CONVERTKIT_API_KEY?: string;
    CONVERTKIT_FORM_ID?: string;
    BUTTONDOWN_API_KEY?: string;
  }
}
