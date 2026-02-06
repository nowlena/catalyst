import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { z } from 'zod';

import { defaultLocale } from '~/i18n/locales';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

const MAKESWIFT_SITE_API_KEY = process.env.MAKESWIFT_SITE_API_KEY;

const MAKESWIFT_API_ORIGIN =
  process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN ??
  process.env.MAKESWIFT_API_ORIGIN ??
  'https://api.makeswift.com';

const MakeswiftPageResponseSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
});

function normalizeLocale(locale: string): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}

export async function getMakeswiftPageMetadata({ path, locale }: { path: string; locale: string }) {
  const siteVersion = await getSiteVersion();

  const versionRef = siteVersion?.version === 'Live' ? 'ref:live' : 'ref:draft';
  const normalizedLocale = normalizeLocale(locale);

  const url = new URL(`/v6/pages${path}`, MAKESWIFT_API_ORIGIN);

  url.searchParams.set('versionRef', versionRef);
  url.searchParams.set('siteId', 'MISSING SITE ID');

  if (normalizedLocale) {
    url.searchParams.set('locale', normalizedLocale);
  }

  const response = await fetch(url, {
    headers: {
      'x-api-key': MAKESWIFT_SITE_API_KEY,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data: unknown = await response.json();
  const page = MakeswiftPageResponseSchema.parse(data);

  return {
    ...(page.title && { title: page.title }),
    ...(page.description && { description: page.description }),
  };
}
