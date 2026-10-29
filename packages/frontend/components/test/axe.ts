import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * axe on what is rendered. Colour contrast needs a real layout (the browser check covers it);
 * `region` wants every bit of a page in a landmark, and a single component is no page.
 */
export async function expectNoAxeViolations(root: Element = document.body): Promise<void> {
  const results = await axe.run(root, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}
