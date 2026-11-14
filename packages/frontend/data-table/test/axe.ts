import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * axe on what is rendered. Always off: colour contrast (it needs a real layout; the browser check
 * covers it), label in name (`label-content-name-mismatch` measures text on a canvas, which jsdom
 * has not: here it only errors; the browser check covers it) and `region` (a single form is no
 * page; React Aria's popovers also keep a hidden "Dismiss" button for screen readers outside their
 * dialog).
 */
export async function expectNoAxeViolations(root: Element = document.body): Promise<void> {
  const results = await axe.run(root, {
    rules: {
      'color-contrast': { enabled: false },
      'label-content-name-mismatch': { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}
