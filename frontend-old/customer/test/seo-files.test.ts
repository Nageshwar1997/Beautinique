import { describe, expect, it } from 'vitest';

import routes from '../app/routes';
import { meta as creditsMeta } from '../app/routes/credits';
import { meta as homeMeta } from '../app/routes/home';
import { meta as privacyMeta } from '../app/routes/privacy';
import { loader as robots } from '../app/routes/robots-txt';
import { meta as signInMeta } from '../app/routes/sign-in';
import { loader as sitemap, SITEMAP_PATHS } from '../app/routes/sitemap-xml';
import { meta as termsMeta } from '../app/routes/terms';

const request = (path: string) => new Request(`https://shop.example${path}`);

/** Whether a page's meta keeps it out of search results. */
const noindex = (meta: (args: never) => unknown) =>
  (meta({} as never) as Record<string, string>[]).some(
    (tag) => tag.name === 'robots' && (tag.content ?? '').includes('noindex'),
  );

describe('robots.txt and sitemap.xml (LIVE-003)', () => {
  it('have their own routes', () => {
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'robots.txt', file: 'routes/robots-txt.ts' }),
    );
    expect(routes).toContainEqual(
      expect.objectContaining({ path: 'sitemap.xml', file: 'routes/sitemap-xml.ts' }),
    );
  });

  it('robots.txt lets every page be crawled but the API, and names the sitemap on its own host', async () => {
    const response = robots({ request: request('/robots.txt') });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toBe(
      'User-agent: *\nDisallow: /api/\n\nSitemap: https://shop.example/sitemap.xml\n',
    );
  });

  it('sitemap.xml lists each open page once, on the host that serves it', async () => {
    const response = sitemap({ request: request('/sitemap.xml') });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    const body = await response.text();
    expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset ')).toBe(true);
    expect([...body.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1])).toEqual([
      'https://shop.example/',
      'https://shop.example/terms',
      'https://shop.example/privacy',
      'https://shop.example/credits',
    ]);
  });

  it('lists only pages that search engines may show, never a noindex one', () => {
    const pages = {
      '/': homeMeta,
      '/terms': termsMeta,
      '/privacy': privacyMeta,
      '/credits': creditsMeta,
    };
    expect(Object.keys(pages)).toEqual([...SITEMAP_PATHS]);
    for (const meta of Object.values(pages)) expect(noindex(meta)).toBe(false);
    // a private page keeps its own noindex, which robots.txt lets crawlers read
    expect(noindex(signInMeta)).toBe(true);
  });
});
