import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: import.meta.dirname,
    include: ['**/*.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // the end-to-end tests run real npm and git; keep them from competing for the CPU
    fileParallelism: false,
  },
});
