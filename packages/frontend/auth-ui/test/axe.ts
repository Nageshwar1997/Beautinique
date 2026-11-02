import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * axe on what is rendered. Always off: colour contrast (it needs a real layout; the browser check
 * covers it) and `region` (a single form is no page; React Aria's popovers also keep a hidden
 * "Dismiss" button for screen readers outside their dialog).
 */
export async function expectNoAxeViolations(root: Element = document.body): Promise<void> {
  const results = await axe.run(root, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}
