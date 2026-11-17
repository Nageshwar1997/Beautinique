import { index, layout, prefix, route, type RouteConfig } from '@react-router/dev/routes';

/** The app's route table. Add pages here (files in app/routes), and to app/nav.ts when they are ready. */
export default [
  index('routes/home.tsx'),
  route('credits', 'routes/credits.tsx'),
  // auth (ARCHITECTURE §9.2): separate pages, each keeps `next`
  route('sign-in', 'routes/sign-in.tsx'),
  route('sign-up', 'routes/sign-up.tsx'),
  // where Google, LinkedIn or GitHub sends a new account for its consent (T3.1 PR 4)
  route('sign-up/finish', 'routes/sign-up-finish.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('invitation', 'routes/invitation.tsx'),
  // the account (signed in only; owner, 2026-11-03): /account goes to its security page
  ...prefix('account', [
    layout('routes/account.tsx', [
      index('routes/account-index.tsx'),
      route('security', 'routes/account-security.tsx'),
      route('security/authenticator', 'routes/account-authenticator.tsx'),
      route('devices', 'routes/account-devices.tsx'),
    ]),
  ]),
  // the dummy legal pages the sign-up consent links to (version dummy-1)
  route('terms', 'routes/terms.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  // for search engines (LIVE-003): what to crawl, and the pages to list
  route('robots.txt', 'routes/robots-txt.ts'),
  route('sitemap.xml', 'routes/sitemap-xml.ts'),
  // Chrome DevTools' own request: a quiet 404 instead of an error in the server log
  route('.well-known/appspecific/com.chrome.devtools.json', 'routes/devtools-json.ts'),
] satisfies RouteConfig;
