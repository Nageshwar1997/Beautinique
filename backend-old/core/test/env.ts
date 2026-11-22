/**
 * The MongoDB and Valkey the tests use: the laptop's and CI's (`npm run infra:up`), or
 * MONGO_TEST_URI and REDIS_TEST_URL. Mutation runs set them to their own (`npm run
 * infra:mutation:up`, ports 27018 and 6380), so they never write to the ones a dev server uses
 * (RULES §6). The only test file that may read env (eslint.config.js).
 */
export const MONGO_URI = process.env.MONGO_TEST_URI ?? 'mongodb://localhost:27017/?replicaSet=rs0';
export const REDIS_URL = process.env.REDIS_TEST_URL ?? 'redis://localhost:6379';
