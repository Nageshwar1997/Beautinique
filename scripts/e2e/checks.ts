/// <reference lib="dom" />
// What every app's E2E checks on a screen: axe (colour contrast too) once nothing moves, and no
// sideways scroll on a phone. The page functions run in the browser, hence the DOM types.
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Waits until nothing is fading or moving in or out (a menu, a dialog, a toast): mid-fade text is
 * paler than it stays, which axe's contrast check would count. Endless ones (a spinner) are skipped.
 */
async function animationsDone(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== 'running' ||
          animation.effect?.getComputedTiming().endTime === Infinity,
      ),
  );
}

/** axe on the page once it is still, colour contrast included (a real layout here). */
export async function expectNoAxeViolations(page: Page) {
  await animationsDone(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

/**
 * Nothing wider than the screen (no sideways scroll on a phone), measured against the screen the
 * project set. Not `innerWidth`: a mobile emulation widens its layout to fit what overflows, so
 * innerWidth grew with the page and the check could never fail (QA-ADM-001).
 */
export async function expectNoSideScroll(page: Page) {
  const { wide, inner } = await page.evaluate(() => ({
    wide: document.documentElement.scrollWidth,
    inner: window.innerWidth,
  }));
  const screen = page.viewportSize()?.width ?? inner;
  expect(
    wide,
    `the page is ${String(wide)} px wide on a ${String(screen)} px screen`,
  ).toBeLessThanOrEqual(screen);
}
