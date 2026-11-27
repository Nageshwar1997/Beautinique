import { serviceUnavailable } from '@beautinique/backend-server-kit';
import { conflict } from '@beautinique/backend-server-kit';
import { MongoNetworkError, MongoServerError } from 'mongodb';
import { describe, expect, it } from 'vitest';

import {
  isUnavailable,
  MAX_ATTEMPTS,
  RETRY_DELAYS_MS,
  RETRY_WINDOW_MS,
  retryDelay,
} from '../src/retry.ts';

const HOUR = 60 * 60_000;

describe('the retries of a delivery (docs/ARCHITECTURE.md §3 rule 6)', () => {
  it('AC-PLATFORM-5: 8 tries in about 6 hours, each wait longer than the one before', () => {
    expect(MAX_ATTEMPTS).toBe(8);
    expect(RETRY_DELAYS_MS).toHaveLength(MAX_ATTEMPTS - 1);
    for (let index = 1; index < RETRY_DELAYS_MS.length; index += 1) {
      expect(RETRY_DELAYS_MS[index]).toBeGreaterThan(RETRY_DELAYS_MS[index - 1] as number);
    }
    expect(RETRY_WINDOW_MS).toBeGreaterThan(5.5 * HOUR);
    expect(RETRY_WINDOW_MS).toBeLessThanOrEqual(6 * HOUR);
  });

  it('AC-PLATFORM-5: the wait after each try, and the last one past the end', () => {
    expect(retryDelay(1)).toBe(60_000);
    expect(retryDelay(7)).toBe(150 * 60_000);
    expect(retryDelay(9)).toBe(150 * 60_000);
    expect(retryDelay(0)).toBe(60_000);
  });

  it('AC-PLATFORM-5: only a database or a service out of reach is "down"; a handler error is not', () => {
    expect(isUnavailable(serviceUnavailable(5))).toBe(true);
    expect(isUnavailable(new MongoNetworkError('gone'))).toBe(true);
    expect(isUnavailable(new MongoServerError({ code: 50, errmsg: 'time' }))).toBe(true);
    expect(isUnavailable(new MongoServerError({ code: 11000, errmsg: 'dup' }))).toBe(false);
    expect(isUnavailable(conflict())).toBe(false);
    expect(isUnavailable(new TypeError('a bug'))).toBe(false);
  });
});
