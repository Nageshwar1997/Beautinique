// The apps' Playwright `test`: page loads wait until the app has heard from the server.
import { expect, type Page, test as base } from '@playwright/test';

export { expect };

/**
 * Waits until the app has heard from the server (app-shell ServerWake, DESIGN §6): no loader
 * (`<html data-server-check>`) and no wake-up screen. Until then the app is inert, and Playwright's
 * `fill` types nothing into an inert field (no error), and a forced click lands on the loader.
 */
export async function appReady(page: Page): Promise<void> {
  await expect(page.locator('html')).not.toHaveAttribute('data-server-check');
  await expect(page.locator('[data-server-wake]')).toHaveCount(0);
}

/** `page`, with `goto` and `reload` waiting for appReady after the load (other sites pass at once). */
export function waitForAppAfterLoads(page: Page): Page {
  const goto = page.goto.bind(page);
  const reload = page.reload.bind(page);
  page.goto = async (...args) => {
    const response = await goto(...args);
    await appReady(page);
    return response;
  };
  page.reload = async (...args) => {
    const response = await reload(...args);
    await appReady(page);
    return response;
  };
  return page;
}

/** Playwright's `test`, with a `page` whose loads wait for appReady. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await use(waitForAppAfterLoads(page));
  },
});
