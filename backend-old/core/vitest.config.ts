import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // a test that starts core waits for its release steps: every index on a fresh database, the
    // audit log's in a second one (T4.1 PR C), while the other files build theirs
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
