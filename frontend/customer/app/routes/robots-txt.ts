/**
 * robots.txt for search engines (LIVE-003): every page may be crawled. The private pages (sign-in,
 * account ...) say `noindex` themselves, and a crawler has to fetch a page to read that, so they are
 * not blocked here; only the API is. The sitemap's address comes from the request, so it is right on
 * whichever host serves the app.
 */
export function loader({ request }: { request: Request }) {
  const { origin } = new URL(request.url);
  const body = ['User-agent: *', 'Disallow: /api/', '', `Sitemap: ${origin}/sitemap.xml`, ''].join(
    '\n',
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
