import { index, route, type RouteConfig } from '@react-router/dev/routes';

/** The app's route table. Add pages here (files in app/routes), and to app/nav.ts when they are ready. */
export default [
  index('routes/home.tsx'),
  route('credits', 'routes/credits.tsx'),
  // auth (ARCHITECTURE §9.2): separate pages, each keeps `next`
  route('sign-in', 'routes/sign-in.tsx'),
  route('sign-up', 'routes/sign-up.tsx'),
  route('forgot-password', 'routes/forgot-password.tsx'),
  route('invitation', 'routes/invitation.tsx'),
  // the dummy legal pages the sign-up consent links to (version dummy-1)
  route('terms', 'routes/terms.tsx'),
  route('privacy', 'routes/privacy.tsx'),
  // Chrome DevTools' own request: a quiet 404 instead of an error in the server log
  route('.well-known/appspecific/com.chrome.devtools.json', 'routes/devtools-json.ts'),
] satisfies RouteConfig;
