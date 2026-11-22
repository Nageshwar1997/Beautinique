import { configure } from '@testing-library/react';

// `waitFor` defaults to 1s. On a busy machine (CI, several test runs at once) a navigation can take
// longer than that without anything being wrong, so give it room: the tests never *depend* on the time.
configure({ asyncUtilTimeout: 10_000 });

export interface NavigationGateOptions {
  /**
   * Every navigation also takes this many ms, like a real route with middleware or a lazy page. Only
   * for tests that check invariants which hold for *any* timing (fast-typing fuzz); a test that needs
   * a specific order of events uses `hold()` / `release()` instead.
   * @default 0
   */
  latencyMs?: number;
}

/**
 * Lets a test decide when a data router's navigation commits, instead of guessing with a timer.
 *
 * Use `gate.pass` as the route's `loader`. By default a navigation goes through at once. After
 * `hold()` every navigation waits inside the loader (the router stays in "loading", the old URL
 * stays committed) until `release()`: that is the window a real, slow navigation has, with the
 * order of events exactly under the test's control.
 */
export const createNavigationGate = ({ latencyMs = 0 }: NavigationGateOptions = {}) => {
  let held = false;
  let waiting: (() => void)[] = [];

  return {
    /** Navigations wait until `release()`. */
    hold: () => {
      held = true;
    },
    /** Lets every waiting navigation (and later ones) through. */
    release: () => {
      held = false;
      const toRelease = waiting;
      waiting = [];
      for (const resume of toRelease) resume();
    },
    /** The route `loader`. */
    pass: async () => {
      if (latencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, latencyMs));
      }

      if (held) {
        await new Promise<void>((resolve) => {
          waiting.push(resolve);
        });
      }

      return null;
    },
  };
};
