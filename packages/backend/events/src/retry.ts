import { isMongoUnavailable } from '@beautinique/backend-mongo';
import { AppError } from '@beautinique/backend-server-kit';

/** How many times a delivery or a timer is tried before it is given up (docs/ARCHITECTURE.md §3 rule 6). */
export const MAX_ATTEMPTS = 8;

/**
 * How long to wait after each failed try, the first to the seventh: 8 tries in about 6 hours
 * (5 hours 51 minutes from the first to the last).
 */
export const RETRY_DELAYS_MS: readonly number[] = Object.freeze([
  60_000,
  5 * 60_000,
  15 * 60_000,
  30 * 60_000,
  60 * 60_000,
  90 * 60_000,
  150 * 60_000,
]);

/** From the first try to the last: the longest a failing delivery stays pending. */
export const RETRY_WINDOW_MS = RETRY_DELAYS_MS.reduce((sum, delay) => sum + delay, 0);

/**
 * When the other side is down (its database, its process), the next try is this far off and the
 * count does not go up (§10.2 rule 11): being down is not the handler's fault.
 */
export const UNAVAILABLE_RETRY_MS = 60_000;

/** The wait after the `attempts`-th failed try (1 to 7; past the last, the last). */
export function retryDelay(attempts: number): number {
  const index = Math.min(Math.max(attempts, 1), RETRY_DELAYS_MS.length) - 1;
  return RETRY_DELAYS_MS[index] as number;
}

/** Whether an error says only that a database or a service was out of reach: a 503, or the driver's own. */
export function isUnavailable(thrown: unknown): boolean {
  return (
    isMongoUnavailable(thrown) ||
    (thrown instanceof AppError && thrown.code === 'SERVICE_UNAVAILABLE')
  );
}
