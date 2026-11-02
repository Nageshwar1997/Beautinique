// The customer app's E2E (ARCHITECTURE §9.2, owner 2026-11-02): the real app on its dev server, the
// whole backend (scripts/e2e/backend.ts) with Mailpit, in Chromium at 360, 768 and 1280 px, light
// and dark, axe on every screen. `npm run e2e --workspace customer` (needs `npm run infra:up` and
// `npx playwright install chromium`); Firefox and WebKit on the laptop: `-- --project=firefox`.
import { randomBytes, randomUUID } from 'node:crypto';

import { defineConfig, devices } from '@playwright/test';

const APP_PORT = 3101;
const GATEWAY_PORT = 8090;

// made once, in the main process, before the workers start (they inherit the env): the web
// servers and the tests then share one run
process.env.BQ_E2E_RUN ??= randomUUID().slice(0, 8);
process.env.BQ_E2E_ORIGIN_SECRET ??= randomBytes(32).toString('base64url');

const SIZES = [
  { name: '360', viewport: { width: 360, height: 740 }, mobile: true },
  { name: '768', viewport: { width: 768, height: 1024 }, mobile: false },
  { name: '1280', viewport: { width: 1280, height: 800 }, mobile: false },
] as const;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI === undefined ? 0 : 1,
  reporter: process.env.CI === undefined ? 'list' : [['list'], ['github']],
  // a sign-up hashes a password (argon2id) and sends an email: slow on a busy laptop or CI runner
  timeout: 180_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: `http://localhost:${String(APP_PORT)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    ...SIZES.flatMap((size) =>
      (['light', 'dark'] as const).map((colorScheme) => ({
        name: `chromium-${size.name}-${colorScheme}`,
        use: {
          ...devices['Desktop Chrome'],
          viewport: size.viewport,
          isMobile: size.mobile,
          hasTouch: size.mobile,
          colorScheme,
        },
      })),
    ),
    // laptop only, by name (owner, 2026-11-02): CI runs the Chromium projects
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'node --conditions=beautinique-source scripts/e2e/backend.ts',
      cwd: '../..',
      url: `http://localhost:${String(GATEWAY_PORT)}/ready`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: 'pipe',
      env: {
        BQ_E2E_GATEWAY_PORT: String(GATEWAY_PORT),
        BQ_E2E_APP_HOSTS: `customer=localhost:${String(APP_PORT)}`,
      },
    },
    {
      command: `npm run dev -- --port ${String(APP_PORT)}`,
      url: `http://localhost:${String(APP_PORT)}/terms`,
      reuseExistingServer: false,
      timeout: 120_000,
      // the dev server's /api proxy goes to the e2e backend (these win over frontend/customer/.env)
      env: {
        BQ_GATEWAY_URL: `http://localhost:${String(GATEWAY_PORT)}`,
        ORIGIN_SECRET: process.env.BQ_E2E_ORIGIN_SECRET,
      },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: '../../scripts/e2e/cleanup.ts',
});
