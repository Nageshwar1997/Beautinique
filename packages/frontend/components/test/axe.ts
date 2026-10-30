import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * axe on what is rendered. Always off: colour contrast (it needs a real layout; the browser check
 * covers it) and `region` (a single component is no page; React Aria's popovers also keep a hidden
 * "Dismiss" button for screen readers outside their dialog). `allow` turns off more, each with
 * its reason at the call.
 */
export async function expectNoAxeViolations(
  root: Element = document.body,
  allow: readonly string[] = [],
): Promise<void> {
  const rules: Record<string, { enabled: boolean }> = {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  };
  for (const id of allow) rules[id] = { enabled: false };
  const results = await axe.run(root, { rules });
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}
