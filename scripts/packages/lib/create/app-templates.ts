import type { AppId } from '../../../../packages/shared/contracts/src/platform.ts';
import { INSTALL_HEAD_TAGS, ROSE, webManifest } from './install.ts';
import { pickVersions } from './scaffold.ts';

/** spa: Vite + React Router data router. ssr: React Router framework mode. pwa: spa + installable, offline shell. */
export type AppKind = 'spa' | 'ssr' | 'pwa';

/** ARCHITECTURE §9.1: Customer is server-rendered, Delivery is a PWA, the rest are SPAs. */
export const APP_KIND: Record<AppId, AppKind> = {
  customer: 'ssr',
  seller: 'spa',
  admin: 'spa',
  superadmin: 'spa',
  master: 'spa',
  support: 'spa',
  finance: 'spa',
  logistics: 'spa',
  delivery: 'pwa',
  growth: 'spa',
  creator: 'spa',
};

export const APP_KIND_LABELS: Record<AppKind, string> = {
  spa: 'Vite + React SPA (React Router data router)',
  ssr: 'React Router framework mode (server-rendered)',
  pwa: 'Vite + React PWA (installable, offline shell)',
};

/** Names people see (DESIGN §10). */
export const APP_TITLES: Record<AppId, string> = {
  customer: 'Beautinique',
  seller: 'Beautinique Seller',
  admin: 'Beautinique Admin',
  superadmin: 'Beautinique Super Admin',
  master: 'Beautinique Master',
  support: 'Beautinique Support Desk',
  finance: 'Beautinique Finance',
  logistics: 'Beautinique Logistics Ops',
  delivery: 'Beautinique Delivery',
  growth: 'Beautinique Growth Studio',
  creator: 'Beautinique Creator',
};

/**
 * What each app will be for, in one line under its name while it has no pages yet: a new app's
 * "Coming soon" home (owner, 2026-11-09, QA audit Q-014: never a developer's note to the public).
 */
export const APP_TAGLINES: Record<AppId, string> = {
  customer:
    'Genuine brands, true-to-life shades and clear prices, every product checked in our own warehouse.',
  seller:
    'Brands and authorised distributors will list products, manage stock and follow their orders here.',
  admin: 'The Beautinique team will review sellers, listings and orders here.',
  superadmin: 'Super Admins will handle escalated reviews and look after the admin teams here.',
  master: "Beautinique's owners will manage roles, approvals and emergency controls here.",
  support: 'The support team will answer tickets, complaints and grievances here.',
  finance: 'The finance team will run settlements, payouts, invoices and reconciliation here.',
  logistics: 'The logistics team will run hubs, line-haul and the delivery control tower here.',
  delivery: 'Delivery partners will see their run sheets and deliver orders here.',
  growth: 'The growth team will run banners, campaigns, loyalty and gift cards here.',
  creator: 'Creators will build their storefronts, share looks and track their earnings here.',
};

/** The gateway's local port: every app's dev server sends /api there (like the Vercel rewrite). */
export const GATEWAY_PORT = 8080;

/**
 * The laptop's origin secret (backend/gateway/.env.example): public, for local runs only. Live, each
 * Vercel project's route sends its own from the ORIGIN_SECRET env (ARCHITECTURE §7.2).
 */
export const LOCAL_ORIGIN_SECRET = 'not-a-secret-not-a-secret-not-a-secret';

/** The dev server's /api proxy: to the local gateway, with the origin secret the Vercel route adds live. */
const apiProxy = `  // /api goes to the local gateway, the same path the Vercel rewrite takes in production, with the
  // laptop's origin secret (public; live, Vercel sends its own, ARCHITECTURE §7.2)
  server: {
    port,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:${String(GATEWAY_PORT)}',
        headers: { 'x-origin-secret': '${LOCAL_ORIGIN_SECRET}' },
      },
    },
  },`;

/** A block of a config file one level deeper (inside the function form's returned object). */
const indent = (block: string) => block.replace(/^(?=.)/gm, '  ');

/** The env read in a vite config: .env on the laptop, Vercel's env in its build (none in CI). */
const gatewayEnv = `  // .env on the laptop, Vercel's env in its build (none in CI: the key stays empty)
  const env = loadEnv(mode, import.meta.dirname, '');
  const gatewayUrl = (env.BQ_GATEWAY_URL ?? '').trim().replace(/\\/+$/, '');`;

/** The one env key the browser gets: the server's address, for the wake-up's straight call. */
const gatewayDefine = `    // the one key the browser gets: the server's address, for the wake-up screen's straight call to
    // its /wake (ARCHITECTURE §11.1)
    define: { 'import.meta.env.BQ_GATEWAY_URL': JSON.stringify(gatewayUrl) },`;

export interface AppSpec {
  app: AppId;
  kind: AppKind;
  title: string;
  /** dev and preview port */
  port: number;
  /** ranges for every library the app uses */
  versions: Record<string, string>;
}

/** The libraries each kind needs, for resolveVersions. */
export function appLibraries(kind: AppKind): { dependencies: string[]; devDependencies: string[] } {
  const common = {
    dependencies: [
      'react',
      'react-dom',
      'react-router',
      '@tanstack/react-query',
      '@beautinique/frontend-styles',
      // the wake-up and the API client's gate: no call before the server answered (ARCHITECTURE §11.1)
      '@beautinique/frontend-api-client',
      '@beautinique/frontend-app-shell',
    ],
    devDependencies: [
      '@tailwindcss/vite',
      'tailwindcss',
      'vite',
      'typescript',
      '@types/react',
      '@types/react-dom',
      '@types/node',
      'vitest',
      '@vitejs/plugin-react',
      '@testing-library/react',
      'jsdom',
    ],
  };
  if (kind === 'ssr') {
    return {
      dependencies: [...common.dependencies, '@react-router/node', '@react-router/serve', 'isbot'],
      devDependencies: [...common.devDependencies, '@react-router/dev'],
    };
  }
  if (kind === 'pwa') {
    return { ...common, devDependencies: [...common.devDependencies, 'vite-plugin-pwa'] };
  }
  return common;
}

function manifest(spec: AppSpec): Record<string, unknown> {
  const libs = appLibraries(spec.kind);
  const scripts =
    spec.kind === 'ssr'
      ? {
          dev: 'react-router dev',
          build: 'react-router build',
          start: 'react-router-serve ./build/server/index.js',
          typecheck: 'react-router typegen && tsc',
          // route types (.react-router/, not committed) must exist before type-aware lint rules run
          lint: 'react-router typegen && eslint .',
          test: 'vitest run',
        }
      : {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
          typecheck: 'tsc -b',
          lint: 'eslint .',
          test: 'vitest run',
        };
  return {
    name: spec.app,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts,
    dependencies: pickVersions(spec.versions, libs.dependencies),
    devDependencies: pickVersions(spec.versions, libs.devDependencies),
  };
}

/** The install tags in a page head (install.ts), indented for index.html or the SSR root. */
const installTags = (indentBy: string) =>
  INSTALL_HEAD_TAGS.map((tag) => `${indentBy}${tag}`).join('\n');

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${ROSE}" />
  <text x="32" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#FFFFFF">B</text>
</svg>
`;

const indexCss = `@import 'tailwindcss';
@import '@beautinique/frontend-styles';
@import '@beautinique/frontend-app-shell/tailwind.css';
`;

/** The API client and Query cache, the same for every kind: every call waits for the wake-up. */
const providersTsx = (
  spec: AppSpec,
) => `import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';
import { type ReactNode, useState } from 'react';

/**
 * The app's API client and Query cache (ARCHITECTURE §9.2), made once per render tree. Every call
 * waits until the server has answered the wake-up (waitForServer; ServerWake's onReady opens it,
 * ARCHITECTURE §11.1).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => createApiClient({ app: '${spec.app}', waitForServer: true }));
  const [queryClient] = useState(createQueryClient);
  return (
    <ApiProvider client={client} queryClient={queryClient}>
      {children}
    </ApiProvider>
  );
}
`;

/** The wake address constant and the AppWake component, the same for every kind. */
const appWake = (
  spec: AppSpec,
) => `/** The server's own wake address (gateway /wake), straight; none where the build had no address. */
const GATEWAY_URL = import.meta.env.BQ_GATEWAY_URL;
const WAKE_KICK_URL =
  GATEWAY_URL === undefined || GATEWAY_URL === '' ? undefined : \`\${GATEWAY_URL}/wake\`;

/**
 * The wake-up (ServerWake, ARCHITECTURE §11.1): no page before the server has answered, and no API
 * call either: onReady tells the client its calls may go.
 */
function AppWake({ children }: { children: ReactNode }) {
  const client = useApiClient();
  return (
    <ServerWake
      app="${spec.app}"
      kickUrl={WAKE_KICK_URL}
      onReady={() => {
        client.serverReady();
      }}
    >
      {children}
    </ServerWake>
  );
}
`;

const envDts = `interface ImportMetaEnv {
  /**
   * The server's address (BQ_GATEWAY_URL, the one key vite.config.ts hands to the browser), without a
   * trailing slash: the wake-up screen calls its /wake straight. Empty where the env has none (CI);
   * undefined in unit tests, which do not load vite.config.ts.
   */
  readonly BQ_GATEWAY_URL: string | undefined;
}
`;

function readme(spec: AppSpec): string {
  const ssr = spec.kind === 'ssr';
  return [
    `# ${spec.title} (\`frontend/${spec.app}\`)`,
    '',
    `${spec.kind.toUpperCase()}: ${APP_KIND_LABELS[spec.kind]}. Dev server http://localhost:${String(spec.port)}; \`/api\` gateway (localhost:${String(GATEWAY_PORT)}) pe jata hai, bilkul Vercel rewrite jaisa.`,
    '',
    '## Commands',
    '',
    '```bash',
    `npm run dev --workspace ${spec.app}`,
    `npm run build --workspace ${spec.app}`,
    `npm test --workspace ${spec.app}`,
    '```',
    '',
    '## Structure',
    '',
    ...(ssr
      ? [
          '- `app/root.tsx`: HTML layout, skip link, wake-up (`WakeScript`, `ServerWake`), error page (404 bhi).',
          '- `app/providers.tsx`: API client (`waitForServer`) aur Query cache.',
          '- `app/routes.ts`: route table; pages `app/routes/*.tsx` me.',
          '- `react-router.config.ts`: SSR on.',
        ]
      : [
          '- `src/main.tsx`: app start (React Router data router).',
          '- `src/routes.tsx`: route table; pages `src/pages/*.tsx` me.',
          '- `src/layout.tsx`: providers, wake-up (`ServerWake`), skip link + page outlet.',
          '- `src/providers.tsx`: API client (`waitForServer`) aur Query cache.',
        ]),
    '- **Wake-up (ARCHITECTURE §11.1):** server ke jawab tak saada parda (1.5 s pe wake-up screen), aur tab tak koi API call nahi: `ServerWake` ka `onReady` client ka `serverReady()` kehta hai. `BQ_GATEWAY_URL` (Vercel env) se wake-up server ko seedha bhi bulata hai; laptop pe khaali theek.',
    ...(spec.kind === 'pwa'
      ? [
          '- `vite.config.ts`: service worker (vite-plugin-pwa); manifest `public/` wali file hai; `/api` navigations SW nahi, server leta hai (`navigateFallbackDenylist`).',
        ]
      : []),
    '- **Install (phone pe app ki tarah):** `public/manifest.webmanifest` (`display: standalone`), `public/icons/*` aur `public/apple-touch-icon.png` app ke parivaar ke icons; `npm run icons:install` banata hai (`scripts/packages/lib/create/install.ts`, DESIGN §11).',
    '- Styles: `@beautinique/frontend-styles` (tokens, fonts, utilities).',
    '',
  ].join('\n');
}

/* ---------------- SPA and PWA (Vite react-ts layout) ---------------- */

function viteConfig(spec: AppSpec): string {
  const pwa = spec.kind === 'pwa';
  return `import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
${pwa ? "import { VitePWA } from 'vite-plugin-pwa';\n" : ''}
const port = ${String(spec.port)};

export default defineConfig(({ mode }) => {
${gatewayEnv}
  return {
    plugins: [
      react(),
      tailwindcss(),
      beautiniqueFonts({ preload: ['sans'] }),${
        pwa
          ? `
      VitePWA({
        registerType: 'autoUpdate',
        // the app's own public/manifest.webmanifest, as every app has (npm run icons:install)
        manifest: false,
        // page navigations get the app shell offline, but never /api: those reach the server (a
        // download, a sign-in redirect; QA audit Q-013)
        workbox: { navigateFallbackDenylist: [/^\\/api\\//] },
      }),`
          : ''
      }
    ],
${gatewayDefine}
${indent(apiProxy)}
    preview: { port, strictPort: true },
  };
});
`;
}

const vitestConfig = `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
});
`;

function indexHtml(spec: AppSpec): string {
  const pwa = spec.kind === 'pwa';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/${pwa ? 'icon' : 'favicon'}.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0${pwa ? ', viewport-fit=cover' : ''}" />
    <meta name="theme-color" content="${ROSE}" />
    <!-- install: the app's manifest (opens standalone, no address bar) and the iOS home-screen icon -->
${installTags('    ')}
    <title>${spec.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

const mainTsx = `import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes';

const root = document.getElementById('root');
if (!root) {
  throw new Error('index.html has no #root element');
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>,
);
`;

const routesTsx = `import type { RouteObject } from 'react-router';

import { Layout } from './layout';
import { HomePage } from './pages/home';
import { NotFoundPage } from './pages/not-found';

/** The app's route table. Add pages here. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
`;

const layoutTsx = (
  spec: AppSpec,
) => `import { useApiClient } from '@beautinique/frontend-api-client';
import { ServerWake } from '@beautinique/frontend-app-shell';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { Providers } from './providers';

${appWake(spec)}
/** Every page: a skip link to the main content (DESIGN §8), then the page. */
export function Frame() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Outlet />
    </>
  );
}

/** The app's root route: its providers, the wake-up, then the frame. */
export function Layout() {
  return (
    <Providers>
      <AppWake>
        <Frame />
      </AppWake>
    </Providers>
  );
}
`;

/** A string literal as Prettier writes it: single quotes, double where the text has an apostrophe. */
const literal = (text: string) => (text.includes("'") ? JSON.stringify(text) : `'${text}'`);

/** `const TAGLINE = '...';` on one line when it fits in 100 columns, else broken as Prettier does. */
const taglineConst = (app: AppId) => {
  const line = `const TAGLINE = ${literal(APP_TAGLINES[app])};`;
  return line.length <= 100 ? line : `const TAGLINE =\n  ${literal(APP_TAGLINES[app])};`;
};

/** The home until the app has pages (Q-014): its name, "Coming soon" and what it will be for. */
const comingSoon = (
  spec: AppSpec,
  component: string,
) => `/** The home until the app has pages: its name, that it is coming soon, and what it will be for. */
export ${component === 'Home' ? 'default ' : ''}function ${component}() {
  return (
    <main id="main" className="container-page flex min-h-dvh flex-col justify-center py-16">
      <p className="text-brand-text text-sm font-medium">Coming soon</p>
      <h1 className="font-display mt-2 text-4xl font-medium">${spec.title}</h1>
      <p className="text-foreground-muted mt-3 max-w-prose">{TAGLINE}</p>
    </main>
  );
}
`;

const homeTsx = (spec: AppSpec) => `${taglineConst(spec.app)}

${comingSoon(spec, 'HomePage')}`;

const notFoundTsx = `import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">Page not found</h1>
      <p className="text-foreground-muted mt-2">
        <Link to="/" className="text-brand-text underline">
          Go to the home page
        </Link>
      </p>
    </main>
  );
}
`;

const spaTest = (
  spec: AppSpec,
) => `import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { Frame } from '../src/layout';
import { Providers } from '../src/providers';
import { routes } from '../src/routes';

afterEach(cleanup);

// the app's routes inside its providers, but without the wake-up (it would call the server)
const [root] = routes as [RouteObject];
const testRoutes: RouteObject[] = [
  {
    ...root,
    element: (
      <Providers>
        <Frame />
      </Providers>
    ),
  },
];

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(testRoutes, { initialEntries: [path] })} />);

describe('${spec.app}', () => {
  it('says the app is coming soon and what it will be for (no note for developers)', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: '${spec.title}' })).toBeTruthy();
    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).nextElementSibling?.textContent).toBeTruthy();
    expect(document.body.textContent).not.toContain('routes');
  });

  it('shows "Page not found" for unknown paths', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
  });

  it('starts with a skip link to the main content', async () => {
    renderAt('/');
    const skip = await screen.findByRole('link', { name: 'Skip to content' });
    expect(skip.getAttribute('href')).toBe('#main');
  });
});
`;

const tsconfigRoot = `{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
`;

const tsconfigApp = `{
  "extends": "../../configs/tsconfig/frontend.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "types": ["vite/client"]
  },
  "include": ["src", "test"]
}
`;

const tsconfigNode = `{
  "extends": "../../configs/tsconfig/base.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
`;

const eslintConfig = (ignores: string[]) => `// @ts-check
import { packageConfig } from '../../configs/eslint-config.js';

export default packageConfig({
  platform: 'browser',
  react: true,
  tsconfigRootDir: import.meta.dirname,${ignores.length ? `\n  ignores: ${JSON.stringify(ignores)},` : ''}
});
`;

/* ---------------- SSR (React Router framework mode) ---------------- */

const ssrViteConfig = (spec: AppSpec) => `import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const port = ${String(spec.port)};

export default defineConfig(({ mode }) => {
${gatewayEnv}
  return {
    plugins: [tailwindcss(), reactRouter()],
${gatewayDefine}
${indent(apiProxy)}
  };
});
`;

const ssrRouterConfig = `import type { Config } from '@react-router/dev/config';

export default {
  // pages render on the server (SEO, first paint); account, cart and checkout run client-side
  ssr: true,
} satisfies Config;
`;

const ssrRoot = (spec: AppSpec) => `import { useApiClient } from '@beautinique/frontend-api-client';
import { ServerWake, WakeScript } from '@beautinique/frontend-app-shell';
import displayFont from '@beautinique/frontend-styles/fonts/fraunces-latin.woff2?url';
import sansFont from '@beautinique/frontend-styles/fonts/plus-jakarta-sans-latin.woff2?url';
import type { ReactNode } from 'react';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { Providers } from './providers';

${appWake(spec)}
/**
 * The stylesheet as a <link> (in development too, so it is never swapped for a <style> after hydration,
 * which would load the fonts again and flash the fallback font), and the brand fonts preloaded so the
 * first paint already uses them. Vite gives these files the same URLs the stylesheet uses.
 */
export const links: Route.LinksFunction = () => [
  { rel: 'preload', href: sansFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'preload', href: displayFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: stylesheet },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="${ROSE}" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* install: the app's manifest (opens standalone, no address bar) and the iOS home-screen icon */}
${installTags('        ')}
        {/* the wake-up's plain cover from the first paint (ServerWake below) */}
        <WakeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** Every page: the providers (made per render tree), the wake-up, then the page. */
export default function App() {
  return (
    <Providers>
      <AppWake>
        <Outlet />
      </AppWake>
    </Providers>
  );
}

/** Unknown paths (a real 404 status) and unexpected errors. */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="text-foreground-muted mt-2">
        <a href="/" className="text-brand-text underline">
          Go to the home page
        </a>
      </p>
    </main>
  );
}

export const meta: Route.MetaFunction = () => [{ title: '${spec.title}' }];
`;

const ssrRoutes = `import { index, type RouteConfig } from '@react-router/dev/routes';

/** The app's route table. Add pages here (files in app/routes). */
export default [index('routes/home.tsx')] satisfies RouteConfig;
`;

const ssrHome = (spec: AppSpec) => `import type { Route } from './+types/home';

${taglineConst(spec.app)}

export const meta: Route.MetaFunction = () => [
  { title: '${spec.title}' },
  { name: 'description', content: TAGLINE },
];

${comingSoon(spec, 'Home')}`;

const ssrTest = (
  spec: AppSpec,
) => `import { cleanup, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import Home, { meta } from '../app/routes/home';

afterEach(cleanup);

describe('${spec.app}', () => {
  it('says the app is coming soon and what it will be for (no note for developers)', async () => {
    const Stub = createRoutesStub([{ path: '/', Component: Home }]);
    render(<Stub initialEntries={['/']} />);
    expect(await screen.findByRole('heading', { level: 1, name: '${spec.title}' })).toBeTruthy();
    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).nextElementSibling?.textContent).toBeTruthy();
    expect(document.body.textContent).not.toContain('routes');
  });

  it('gives the home page a title and description', () => {
    const tags = meta({} as Parameters<typeof meta>[0]);
    expect(tags).toContainEqual({ title: '${spec.title}' });
    expect(tags.some((tag) => 'name' in tag && tag.name === 'description')).toBe(true);
  });
});
`;

const ssrTsconfig = `{
  "extends": "../../configs/tsconfig/frontend.json",
  "compilerOptions": {
    "types": ["node", "vite/client"],
    "rootDirs": [".", "./.react-router/types"]
  },
  "include": ["**/*", "**/.server/**/*", "**/.client/**/*", ".react-router/types/**/*"],
  "exclude": ["build", "node_modules"]
}
`;

const ssrGitignore = `/build
/.react-router
`;

/** Every file of a new frontend app: relative path -> content. */
export function renderApp(spec: AppSpec): Map<string, string> {
  const files = new Map<string, string>();
  files.set('package.json', `${JSON.stringify(manifest(spec), null, 2)}\n`);
  // its icons are binary: the create command copies them (install.ts copyInstallIcons)
  files.set(
    'public/manifest.webmanifest',
    `${JSON.stringify(webManifest(spec.app, spec.title), null, 2)}\n`,
  );
  files.set('README.md', readme(spec));
  files.set('vitest.config.ts', vitestConfig);
  if (spec.kind === 'ssr') {
    files.set('.gitignore', ssrGitignore);
    files.set('react-router.config.ts', ssrRouterConfig);
    files.set('vite.config.ts', ssrViteConfig(spec));
    files.set('tsconfig.json', ssrTsconfig);
    files.set('eslint.config.js', eslintConfig(['build', '.react-router']));
    files.set('public/favicon.svg', icon);
    files.set('app/app.css', indexCss);
    files.set('app/env.d.ts', envDts);
    files.set('app/providers.tsx', providersTsx(spec));
    files.set('app/root.tsx', ssrRoot(spec));
    files.set('app/routes.ts', ssrRoutes);
    files.set('app/routes/home.tsx', ssrHome(spec));
    files.set('test/home.test.tsx', ssrTest(spec));
    return files;
  }
  files.set('index.html', indexHtml(spec));
  files.set('vite.config.ts', viteConfig(spec));
  files.set('tsconfig.json', tsconfigRoot);
  files.set('tsconfig.app.json', tsconfigApp);
  files.set('tsconfig.node.json', tsconfigNode);
  files.set('eslint.config.js', eslintConfig([]));
  files.set(spec.kind === 'pwa' ? 'public/icon.svg' : 'public/favicon.svg', icon);
  files.set('src/index.css', indexCss);
  files.set('src/env.d.ts', envDts);
  files.set('src/main.tsx', mainTsx);
  files.set('src/providers.tsx', providersTsx(spec));
  files.set('src/routes.tsx', routesTsx);
  files.set('src/layout.tsx', layoutTsx(spec));
  files.set('src/pages/home.tsx', homeTsx(spec));
  files.set('src/pages/not-found.tsx', notFoundTsx);
  files.set('test/app.test.tsx', spaTest(spec));
  return files;
}
