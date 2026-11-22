import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // the tests type into React Aria controls and run axe: on a busy machine (CI) one can take
    // longer than the default 5 s (the components package learnt this, TASKS T6.1)
    testTimeout: 15_000,
  },
});
