/**
 * The Valkey the tests use: the laptop's and CI's (`npm run infra:up`), or REDIS_TEST_URL. Mutation
 * runs set it to their own Valkey (`npm run infra:mutation:up`, port 6380), so they never write to
 * the one a dev server uses. The only test file that may read env (eslint.config.js).
 */
export const REDIS_URL = process.env.REDIS_TEST_URL ?? 'redis://localhost:6379';
