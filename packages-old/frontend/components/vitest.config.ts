import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // many tests drive a picker key by key and run axe: on a busy machine (CI) one can take
    // longer than the default 5 s, and a test cut off leaves its events running into the next
    testTimeout: 15_000,
  },
});
