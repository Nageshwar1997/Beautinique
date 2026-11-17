// The apps' E2E warm-up (each app's e2e/global-setup.ts): every page opened before the tests, so the
// dev server has bundled its dependencies first. A first visit can find a new one; Vite then bundles
// it and reloads the page ("Outdated Optimize Dep"), which cuts the visit short (net::ERR_ABORTED):
// that visit is opened again. On CI the bundle cache is always empty, so this happens there first.
import { chromium, type Page } from '@playwright/test';

/** A visit the dev server's own reload cut short; anything else is a real failure. */
const cutShort = (error: unknown): boolean =>
  error instanceof Error && /ERR_ABORTED|interrupted by another navigation/.test(error.message);

async function open(page: Page, url: string): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      // `load`, not `networkidle`: the app keeps a few calls going (wake, online probe)
      await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
      return;
    } catch (error) {
      if (!cutShort(error) || attempt >= 5) throw error;
    }
  }
}

/** Opens each of `paths` twice (the second after any reload), until its h1 shows. */
export async function warmUp(baseURL: string, paths: readonly string[]): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const path of paths) {
      for (let round = 0; round < 2; round += 1) {
        await open(page, `${baseURL}${path}`);
        await page.locator('h1').first().waitFor({ timeout: 60_000 });
      }
    }
  } finally {
    await browser.close();
  }
}
