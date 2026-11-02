import { chromium, type FullConfig } from '@playwright/test';

/**
 * Before the tests: every page opened once, so the dev server has bundled its dependencies (a
 * first visit can find new ones and reload the page, "Outdated Optimize Dep") before a test looks.
 * `load`, not `networkidle`: the app keeps a few calls going (wake, online probe).
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL ?? '';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const path of ['/', '/sign-in', '/sign-up', '/forgot-password', '/invitation', '/terms']) {
    for (let round = 0; round < 2; round += 1) {
      await page.goto(`${baseURL}${path}`, { waitUntil: 'load', timeout: 120_000 });
      await page.locator('h1').first().waitFor({ timeout: 60_000 });
    }
  }
  await browser.close();
}
