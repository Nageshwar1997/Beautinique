import type { AppId } from '../../../../packages/shared/contracts/src/platform.ts';
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

/** The gateway's local port: every app's dev server sends /api there (like the Vercel rewrite). */
export const GATEWAY_PORT = 8080;

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
    dependencies: ['react', 'react-dom', 'react-router', '@beautinique/frontend-styles'],
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

// Brand colours for files that cannot read CSS variables (icons, manifest): rose-600 and neutral-50.
const ROSE = '#D6336C';
const IVORY = '#FDF8F5';

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${ROSE}" />
  <text x="32" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#FFFFFF">B</text>
</svg>
`;

const indexCss = `@import 'tailwindcss';
@import '@beautinique/frontend-styles';
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
          '- `app/root.tsx`: HTML layout, skip link, error page (404 bhi).',
          '- `app/routes.ts`: route table; pages `app/routes/*.tsx` me.',
          '- `react-router.config.ts`: SSR on.',
        ]
      : [
          '- `src/main.tsx`: app start (React Router data router).',
          '- `src/routes.tsx`: route table; pages `src/pages/*.tsx` me.',
          '- `src/layout.tsx`: skip link + page outlet.',
        ]),
    ...(spec.kind === 'pwa'
      ? ['- `vite.config.ts`: PWA manifest aur service worker (vite-plugin-pwa).']
      : []),
    '- Styles: `@beautinique/frontend-styles` (tokens, fonts, utilities).',
    '',
  ].join('\n');
}

/* ---------------- SPA and PWA (Vite react-ts layout) ---------------- */

function viteConfig(spec: AppSpec): string {
  const pwa = spec.kind === 'pwa';
  const short = spec.title.replace('Beautinique', 'BQ');
  return `import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
${pwa ? "import { VitePWA } from 'vite-plugin-pwa';\n" : ''}
const port = ${String(spec.port)};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    beautiniqueFonts({ preload: ['sans'] }),${
      pwa
        ? `
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '${spec.title}',
        short_name: '${short}',
        description: 'Run sheets, deliveries and payments for Beautinique delivery partners.',
        theme_color: '${ROSE}',
        background_color: '${IVORY}',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),`
        : ''
    }
  ],
  // /api goes to the local gateway, the same path the Vercel rewrite takes in production
  server: { port, strictPort: true, proxy: { '/api': 'http://localhost:${String(GATEWAY_PORT)}' } },
  preview: { port, strictPort: true },
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

const layoutTsx = `import { Outlet } from 'react-router';

/** Every page: a skip link to the main content (DESIGN §8), then the page. */
export function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Outlet />
    </>
  );
}
`;

const homeTsx = (spec: AppSpec) => `export function HomePage() {
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">${spec.title}</h1>
      <p className="text-foreground-muted mt-2">The app is ready. Add pages in src/routes.tsx.</p>
    </main>
  );
}
`;

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
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { routes } from '../src/routes';

afterEach(cleanup);

const renderAt = (path: string) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);

describe('${spec.app}', () => {
  it('shows the home page', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: '${spec.title}' })).toBeTruthy();
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
import { defineConfig } from 'vite';

const port = ${String(spec.port)};

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  // /api goes to the local gateway, the same path the Vercel rewrite takes in production
  server: { port, strictPort: true, proxy: { '/api': 'http://localhost:${String(GATEWAY_PORT)}' } },
});
`;

const ssrRouterConfig = `import type { Config } from '@react-router/dev/config';

export default {
  // pages render on the server (SEO, first paint); account, cart and checkout run client-side
  ssr: true,
} satisfies Config;
`;

const ssrRoot = (
  spec: AppSpec,
) => `import displayFont from '@beautinique/frontend-styles/fonts/fraunces-latin.woff2?url';
import sansFont from '@beautinique/frontend-styles/fonts/plus-jakarta-sans-latin.woff2?url';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="${ROSE}" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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

export default function App() {
  return <Outlet />;
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

export const meta: Route.MetaFunction = () => [
  { title: '${spec.title}' },
  { name: 'description', content: 'Beauty you can trust: genuine brands, real shades, clear prices.' },
];

export default function Home() {
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">${spec.title}</h1>
      <p className="text-foreground-muted mt-2">The app is ready. Add pages in app/routes.ts.</p>
    </main>
  );
}
`;

const ssrTest = (
  spec: AppSpec,
) => `import { cleanup, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import Home, { meta } from '../app/routes/home';

afterEach(cleanup);

describe('${spec.app}', () => {
  it('shows the home page', async () => {
    const Stub = createRoutesStub([{ path: '/', Component: Home }]);
    render(<Stub initialEntries={['/']} />);
    expect(await screen.findByRole('heading', { level: 1, name: '${spec.title}' })).toBeTruthy();
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
  files.set('src/main.tsx', mainTsx);
  files.set('src/routes.tsx', routesTsx);
  files.set('src/layout.tsx', layoutTsx);
  files.set('src/pages/home.tsx', homeTsx(spec));
  files.set('src/pages/not-found.tsx', notFoundTsx);
  files.set('test/app.test.tsx', spaTest(spec));
  return files;
}
