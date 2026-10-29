import { useMemo, useSyncExternalStore } from 'react';

/** A moment: a Date, an ISO string (as the API sends it) or ms since 1970. */
export type Moment = Date | string | number;

const msOf = (until: Moment | null | undefined): number | null => {
  if (until === null || until === undefined) return null;
  const ms =
    until instanceof Date ? until.getTime() : typeof until === 'number' ? until : Date.parse(until);
  return Number.isNaN(ms) ? null : ms;
};

/** Whole seconds left until `ms` (rounded up: 0.2 s left still shows 1), never below 0. */
const secondsLeft = (ms: number): number => Math.max(0, Math.ceil((ms - Date.now()) / 1000));

interface CountdownStore {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => number | null;
}

const NONE: CountdownStore = {
  subscribe: () => () => undefined,
  getSnapshot: () => null,
};

/**
 * One countdown: its value changes only on a tick (never between two reads in one render), the
 * ticks run only while someone listens, and they stop at 0.
 */
function countdownStore(target: number): CountdownStore {
  let value: number | undefined;
  const read = () => {
    value ??= secondsLeft(target);
    return value;
  };
  return {
    getSnapshot: read,
    subscribe(onChange) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const tick = () => {
        const next = secondsLeft(target);
        if (next !== value) {
          value = next;
          onChange();
        }
        const left = target - Date.now();
        // wake at the next whole second of the countdown, so the number never lags a tick behind
        if (left > 0) timer = setTimeout(tick, left % 1000 || 1000);
      };
      read();
      tick();
      return () => {
        clearTimeout(timer);
      };
    },
  };
}

/**
 * The whole seconds left until `until`, ticking down once a second: "Send a new code in 45 s"
 * (the API's `resendAfter`), a code that works until `expiresAt`.
 *
 * ```tsx
 * const left = useCountdown(challenge.resendAfter);
 * <Button disabled={left !== 0}>{left ? `Send a new code in ${left} s` : 'Send a new code'}</Button>
 * ```
 *
 * - `null` on the server and while the page is being hydrated (the two clocks would not agree on
 *   the second, so the page could not match), and for no `until` or an unreadable one. `0` once it
 *   has passed, and the ticking stops then.
 * - The ticks follow the clock, not a counter: a tab the browser put to sleep shows the right
 *   value at its next tick.
 */
export const useCountdown = (until: Moment | null | undefined): number | null => {
  const target = msOf(until);
  const store = useMemo(() => (target === null ? NONE : countdownStore(target)), [target]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
};
