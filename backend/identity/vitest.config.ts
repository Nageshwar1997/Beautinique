import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // sign-ins hash with argon2id (19 MiB, one at a time, slow on purpose): a test with many of
    // them, next to the other files, needs more than the default 5 seconds
    testTimeout: 20_000,
  },
});
