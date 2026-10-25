import { index, route, type RouteConfig } from '@react-router/dev/routes';

/** The app's route table. Add pages here (files in app/routes), and to app/nav.ts when they are ready. */
export default [
  index('routes/home.tsx'),
  route('credits', 'routes/credits.tsx'),
] satisfies RouteConfig;
