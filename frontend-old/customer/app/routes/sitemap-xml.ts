/**
 * The pages search engines may list (LIVE-003): the open ones without `noindex`. Product, brand and
 * category pages join here as they are built (TASKS T7.7).
 */
export const SITEMAP_PATHS = ['/', '/terms', '/privacy', '/credits'] as const;

const escapeXml = (text: string): string =>
  text.replace(/[<>&'"]/g, (char) => `&#${String(char.charCodeAt(0))};`);

/** sitemap.xml: one `<loc>` per page, on whichever host serves the app (the request's). */
export function loader({ request }: { request: Request }) {
  const { origin } = new URL(request.url);
  const urls = SITEMAP_PATHS.map(
    (path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`,
  ).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
