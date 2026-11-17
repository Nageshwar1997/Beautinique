/**
 * Chrome DevTools asks every localhost page for /.well-known/appspecific/com.chrome.devtools.json
 * (its "Automatic workspace folders" feature). We do not offer that, so the answer is a plain 404.
 * Without this resource route React Router would answer the same 404 but log it as an error with a
 * stack trace on every request.
 */
export function loader() {
  return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
}
