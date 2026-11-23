import { expect, test } from 'vitest';

import { sign } from '../src/sign.ts';

// Covers one branch of three on purpose, so the coverage limits have something to stop.
test('a positive number', () => {
  expect(sign(5)).toBe('positive');
});
