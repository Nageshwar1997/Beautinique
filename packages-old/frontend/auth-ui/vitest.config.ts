import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // an https page, as the apps are: the hint cookie is Secure, and `__Host-` cookies need it
    environmentOptions: { jsdom: { url: 'https://bq.example/' } },
    // the tests type into React Aria controls and run axe: on a busy machine (CI) one can take
    // longer than the default 5 s (the components package learnt this, TASKS T6.1)
    testTimeout: 15_000,
    setupFiles: ['./test/setup.ts'],
  },
});
