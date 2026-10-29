import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import {
  type ConnectionStatus,
  createOnlineStatusStore,
  type OnlineStatusStore,
  type OnlineStatusStoreOptions,
} from '../src/online-status-store';

// The browser says whether it has a network through `navigator.onLine` and tells about changes with
// `online` / `offline` events. These tests play the browser by hand: `goOffline()` / `goOnline()`
// set the property and send the event, like the real thing does.
let navigatorOnline: MockInstance<() => boolean>;

const setNavigatorOnline = (value: boolean) => {
  navigatorOnline.mockReturnValue(value);
};

const goOffline = () => {
  setNavigatorOnline(false);
  window.dispatchEvent(new Event('offline'));
};

const goOnline = () => {
  setNavigatorOnline(true);
  window.dispatchEvent(new Event('online'));
};

const showTab = (state: DocumentVisibilityState) => {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  document.dispatchEvent(new Event('visibilitychange'));
};

/** A probe the test answers by hand: every call is recorded and waits for `succeed()` / `fail()`. */
const createProbe = () => {
  const attempts: {
    signal: AbortSignal;
    succeed: () => void;
    fail: () => void;
  }[] = [];

  const probe = vi.fn((signal: AbortSignal) => {
    return new Promise<unknown>((resolve, reject) => {
      attempts.push({
        signal,
        succeed: () => {
          resolve('answer');
        },
        fail: () => {
          reject(new Error('no answer'));
        },
      });
    });
  });

  return { probe, attempts, last: () => attempts.at(-1) };
};

/** Lets the promises that are already settled run, without moving the clock. */
const flush = () => vi.advanceTimersByTimeAsync(0);

// Every store listens to the same `window`, so one that a test forgets to unsubscribe would keep
// answering the events of the tests after it.
const subscriptions: (() => void)[] = [];

const subscribeToStore = (store: OnlineStatusStore, listener: () => void) => {
  const unsubscribe = store.subscribe(listener);
  subscriptions.push(unsubscribe);

  return unsubscribe;
};

const watch = (store: OnlineStatusStore) => {
  const seen: ConnectionStatus[] = [];
  const unsubscribe = subscribeToStore(store, () => {
    seen.push(store.getStatus());
  });

  return { seen, unsubscribe };
};

// Most tests are about the browser's events, so the regular check is off unless a test turns it on.
// The waits between tries are 1s, 2s, 4s, 8s here to keep the timings below easy to read; the real
// default has its own tests (see "the default waits between tries").
const TEST_RETRY_DELAY_MS = (failures: number) => Math.min(1000 * 2 ** (failures - 1), 8000);

const createStore = (options: OnlineStatusStoreOptions = {}) =>
  createOnlineStatusStore({ heartbeatMs: 0, retryDelayMs: TEST_RETRY_DELAY_MS, ...options });

describe('online status store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigatorOnline = vi.spyOn(window.navigator, 'onLine', 'get');
    setNavigatorOnline(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  afterEach(() => {
    for (const unsubscribe of subscriptions.splice(0)) unsubscribe();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('reading the status', () => {
    it('is online when the browser says it has a network, and offline when it does not', () => {
      const store = createStore();

      expect(store.getStatus()).toBe('online');

      setNavigatorOnline(false);
      expect(store.getStatus()).toBe('offline');
    });

    it('reads the browser live while nobody is subscribed, so it is right during render', () => {
      const store = createStore();

      setNavigatorOnline(false);
      expect(store.getStatus()).toBe('offline');

      setNavigatorOnline(true);
      expect(store.getStatus()).toBe('online');
    });

    it('is offline from the start when the page is opened without a network', () => {
      setNavigatorOnline(false);
      const store = createStore();
      const { seen } = watch(store);

      expect(store.getStatus()).toBe('offline');
      expect(seen).toEqual([]); // nothing changed, so nobody is told
    });

    it('says online where there is no navigator (a server)', () => {
      vi.stubGlobal('navigator', undefined);

      expect(createStore().getStatus()).toBe('online');
    });
  });

  describe('going offline', () => {
    it('is offline as soon as the browser says so', () => {
      const store = createStore();
      const { seen } = watch(store);

      goOffline();

      expect(store.getStatus()).toBe('offline');
      expect(seen).toEqual(['offline']);
    });

    it('does not tell anybody twice about the same thing', () => {
      const store = createStore();
      const { seen } = watch(store);

      goOffline();
      goOffline();
      window.dispatchEvent(new Event('offline'));

      expect(seen).toEqual(['offline']);
    });

    it('goes by what the browser says now, not by which event arrived', () => {
      const store = createStore();
      watch(store);

      // an `offline` event whose cause is already gone when the handler runs
      window.dispatchEvent(new Event('offline'));

      expect(store.getStatus()).toBe('online');
    });
  });

  describe('coming back', () => {
    it('is connecting while the first probe is out, and online when it answers', async () => {
      const { probe, last } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);
      goOffline();

      goOnline();
      expect(store.getStatus()).toBe('connecting');
      expect(probe).toHaveBeenCalledTimes(1);

      last()?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'connecting', 'online']);
    });

    it('hands the probe a signal that is not aborted while it is wanted', () => {
      const { probe, last } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();

      expect(last()?.signal.aborted).toBe(false);
    });

    it('stays connecting while the probe is not answered, and tries again with a growing delay', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();

      for (const [index, delay] of [1000, 2000, 4000, 8000, 8000, 8000].entries()) {
        attempts[index]?.fail();
        await flush();

        expect(store.getStatus()).toBe('connecting');
        expect(probe).toHaveBeenCalledTimes(index + 1);

        await vi.advanceTimersByTimeAsync(delay - 1);
        expect(probe).toHaveBeenCalledTimes(index + 1); // not before the delay is over

        await vi.advanceTimersByTimeAsync(1);
        expect(probe).toHaveBeenCalledTimes(index + 2);
      }
    });

    it('is online after a later try answers, and stops probing', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);
      goOffline();
      goOnline();

      attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      attempts[1]?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'connecting', 'online']);

      await vi.advanceTimersByTimeAsync(60_000);
      expect(probe).toHaveBeenCalledTimes(2);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('counts a probe that throws before it returns anything as a failed probe', async () => {
      const probe = vi.fn((): Promise<unknown> => {
        throw new Error('boom');
      });
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();
      await flush();

      expect(store.getStatus()).toBe('connecting');

      await vi.advanceTimersByTimeAsync(1000);
      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('counts a probe that takes too long as failed, and aborts it', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, probeTimeoutMs: 3000 });
      watch(store);
      goOffline();
      goOnline();

      await vi.advanceTimersByTimeAsync(2999);
      expect(attempts[0]?.signal.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(attempts[0]?.signal.aborted).toBe(true);
      expect(store.getStatus()).toBe('connecting');
      expect(probe).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1000); // the retry delay after the first failure
      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('waits 5 seconds for a probe by default', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();

      await vi.advanceTimersByTimeAsync(4999);
      expect(attempts[0]?.signal.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(attempts[0]?.signal.aborted).toBe(true);
    });

    it('ignores the late answer of a probe that already timed out', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, probeTimeoutMs: 1000 });
      watch(store);
      goOffline();
      goOnline();
      await vi.advanceTimersByTimeAsync(1000); // timed out

      attempts[0]?.succeed(); // far too late
      await flush();

      expect(store.getStatus()).toBe('connecting');
    });

    it('uses the retry delays it is given, with the number of failures so far', async () => {
      const { probe, attempts } = createProbe();
      const retryDelayMs = vi.fn((failures: number) => failures * 10);
      const store = createStore({ probe, retryDelayMs });
      watch(store);
      goOffline();
      goOnline();

      attempts[0]?.fail();
      await flush();
      expect(retryDelayMs).toHaveBeenLastCalledWith(1);
      await vi.advanceTimersByTimeAsync(10);

      attempts[1]?.fail();
      await flush();
      expect(retryDelayMs).toHaveBeenLastCalledWith(2);
      await vi.advanceTimersByTimeAsync(20);

      expect(probe).toHaveBeenCalledTimes(3);
    });

    it('does nothing when the browser says online and the status already is', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);

      window.dispatchEvent(new Event('online'));

      expect(store.getStatus()).toBe('online');
      expect(probe).not.toHaveBeenCalled();
      expect(seen).toEqual([]);
    });

    it('does not start a second probe when told online again while connecting', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();

      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('online'));

      expect(probe).toHaveBeenCalledTimes(1);

      attempts[0]?.succeed();
      await flush();
      expect(store.getStatus()).toBe('online');
    });
  });

  describe('going offline while connecting', () => {
    it('aborts the probe that is out, and a late answer from it changes nothing', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();

      goOffline();
      expect(attempts[0]?.signal.aborted).toBe(true);
      expect(store.getStatus()).toBe('offline');

      attempts[0]?.succeed();
      await flush();

      expect(store.getStatus()).toBe('offline');
    });

    it('stops the waiting between tries', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();
      attempts[0]?.fail();
      await flush();
      expect(vi.getTimerCount()).toBeGreaterThan(0); // waiting to try again

      goOffline();

      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(probe).toHaveBeenCalledTimes(1);
    });

    it('is only told about the newest loop when the network flaps', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);
      goOffline();
      goOnline(); // probe A
      goOffline();
      goOnline(); // probe B

      expect(probe).toHaveBeenCalledTimes(2);
      expect(attempts[0]?.signal.aborted).toBe(true);
      expect(attempts[1]?.signal.aborted).toBe(false);

      attempts[0]?.succeed(); // the answer of the old loop
      await flush();
      expect(store.getStatus()).toBe('connecting');

      attempts[1]?.succeed();
      await flush();
      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'connecting', 'offline', 'connecting', 'online']);
    });

    it('a failed answer of an old loop does not start a retry timer', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();
      goOffline();

      attempts[0]?.fail();
      await flush();

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('a tab that was asleep', () => {
    it('looks at the browser again when the tab becomes visible, in case an event was missed', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);

      setNavigatorOnline(false); // no event arrived
      showTab('visible');
      expect(store.getStatus()).toBe('offline');

      setNavigatorOnline(true); // no event arrived either
      showTab('visible');
      expect(store.getStatus()).toBe('connecting');
      expect(probe).toHaveBeenCalledTimes(1);
      expect(seen).toEqual(['offline', 'connecting']);
    });

    it('does not look when the tab is hidden', () => {
      const store = createStore();
      watch(store);

      setNavigatorOnline(false);
      showTab('hidden');

      expect(store.getStatus()).toBe('online');
    });
  });

  describe('checking on request', () => {
    it('stays online when the internet answers, and says nothing', async () => {
      const { probe, last } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);

      store.recheck();
      expect(probe).toHaveBeenCalledTimes(1);
      expect(store.getStatus()).toBe('online'); // not connecting just because it is looking

      last()?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('can be asked again after an earlier check was answered', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);

      store.recheck();
      attempts[0]?.succeed();
      await flush();
      store.recheck();

      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('does not count a failed check from before the last subscriber left', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      const first = watch(store);
      store.recheck();
      attempts[0]?.fail();
      await flush(); // one failure so far
      first.unsubscribe();

      const { seen } = watch(store);
      store.recheck();
      attempts[1]?.fail();
      await flush();

      expect(store.getStatus()).toBe('online'); // this is the first failure of a new start
      expect(seen).toEqual([]);
    });

    it('checks a failed answer once more, and only when that fails too is the user offline', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);

      store.recheck();
      attempts[0]?.fail();
      await flush();
      expect(store.getStatus()).toBe('online'); // could be a blip
      expect(probe).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(999);
      expect(probe).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(probe).toHaveBeenCalledTimes(2);

      attempts[1]?.fail();
      await flush();

      expect(store.getStatus()).toBe('offline');
      expect(seen).toEqual(['offline']);
    });

    it('stays online, without a word, when the second check answers', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      const { seen } = watch(store);

      store.recheck();
      attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      attempts[1]?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual([]);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('does nothing while offline, because the answer is known', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();

      store.recheck();

      expect(probe).not.toHaveBeenCalled();
    });

    it('does nothing while connecting, because that is being checked already', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      watch(store);
      goOffline();
      goOnline();
      expect(probe).toHaveBeenCalledTimes(1);

      store.recheck();

      expect(probe).toHaveBeenCalledTimes(1);
    });

    it('does not start a second probe while one is out', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      watch(store);

      store.recheck();
      store.recheck();

      expect(probe).toHaveBeenCalledTimes(1);
    });

    it('does not start over while a failed check waits to be repeated', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      watch(store);
      store.recheck();
      attempts[0]?.fail();
      await flush();

      store.recheck();

      expect(probe).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(probe).toHaveBeenCalledTimes(2); // the repeat is still on time
    });

    it('does nothing with nobody subscribed', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });

      store.recheck();

      expect(probe).not.toHaveBeenCalled();
    });
  });

  // The browser only says "offline" when the device loses its network. Wi-Fi without internet behind
  // it (a phone hotspot whose data was switched off) says nothing, so only a check can notice.
  describe('the network is there but nothing answers', () => {
    const goUnreachable = async (heartbeatMs = 0) => {
      const fake = createProbe();
      const store = createStore({ probe: fake.probe, heartbeatMs });
      const watched = watch(store);

      store.recheck();
      fake.attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      fake.attempts[1]?.fail();
      await flush();

      return { ...fake, store, ...watched };
    };

    it('is offline, although the browser says online', async () => {
      const { store, seen } = await goUnreachable();

      expect(navigator.onLine).toBe(true);
      expect(store.getStatus()).toBe('offline');
      expect(seen).toEqual(['offline']);
    });

    it('keeps trying with a growing delay, and is online again as soon as something answers', async () => {
      const { store, probe, attempts, seen } = await goUnreachable();
      expect(probe).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(1999);
      expect(probe).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(1);
      expect(probe).toHaveBeenCalledTimes(3); // 2s after the second failure
      attempts[2]?.fail();
      await flush();

      await vi.advanceTimersByTimeAsync(4000);
      expect(probe).toHaveBeenCalledTimes(4); // then 4s
      attempts[3]?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'online']);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('does not turn into connecting when the browser says online again: it never said offline', async () => {
      const { store, probe, seen } = await goUnreachable();

      window.dispatchEvent(new Event('online'));

      expect(store.getStatus()).toBe('offline');
      expect(probe).toHaveBeenCalledTimes(2);
      expect(seen).toEqual(['offline']);
    });

    it("is offline for the browser's reason too once the browser says so, and then connecting when it is back", async () => {
      const { store, probe, attempts, seen } = await goUnreachable();

      goOffline(); // the Wi-Fi is switched off
      expect(store.getStatus()).toBe('offline');
      await vi.advanceTimersByTimeAsync(60_000);
      expect(probe).toHaveBeenCalledTimes(2); // nothing is being asked while there is no network

      goOnline();
      expect(store.getStatus()).toBe('connecting');
      expect(probe).toHaveBeenCalledTimes(3);
      attempts[2]?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'connecting', 'online']);
    });

    it('forgets why it was offline when the last subscriber leaves', async () => {
      const { store, probe, attempts, unsubscribe } = await goUnreachable();
      unsubscribe();

      setNavigatorOnline(false); // the page is looked at again, now without a network
      watch(store);
      expect(store.getStatus()).toBe('offline');

      goOnline();

      expect(store.getStatus()).toBe('connecting'); // the browser's reason, not the old one
      expect(probe).toHaveBeenCalledTimes(3);
      attempts[2]?.succeed();
      await flush();
      expect(store.getStatus()).toBe('online');
    });

    it('does nothing about a recheck, it is being checked already', async () => {
      const { store, probe } = await goUnreachable();

      store.recheck();

      expect(probe).toHaveBeenCalledTimes(2);
    });
  });

  describe('the regular check (heartbeat)', () => {
    it('asks every 15 seconds by default, while online', async () => {
      const { probe, attempts } = createProbe();
      const store = createOnlineStatusStore({ probe });
      watch(store);

      await vi.advanceTimersByTimeAsync(14_999);
      expect(probe).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(probe).toHaveBeenCalledTimes(1);

      attempts[0]?.succeed();
      await flush();
      await vi.advanceTimersByTimeAsync(14_999);
      expect(probe).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('asks as often as it is told to', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 3000 });
      watch(store);

      await vi.advanceTimersByTimeAsync(3000);
      attempts[0]?.succeed();
      await flush();
      await vi.advanceTimersByTimeAsync(3000);

      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('says nothing while the internet keeps answering', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });
      const { seen } = watch(store);

      for (let round = 0; round < 5; round += 1) {
        await vi.advanceTimersByTimeAsync(1000);
        attempts[round]?.succeed();
        await flush();
      }

      expect(probe).toHaveBeenCalledTimes(5);
      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual([]);
    });

    it('is offline when two checks in a row get no answer, and online again by itself afterwards', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      const { seen } = watch(store);

      await vi.advanceTimersByTimeAsync(15_000);
      attempts[0]?.fail();
      await flush();
      expect(store.getStatus()).toBe('online'); // one failure is not enough

      await vi.advanceTimersByTimeAsync(1000);
      attempts[1]?.fail();
      await flush();
      expect(store.getStatus()).toBe('offline');

      await vi.advanceTimersByTimeAsync(2000);
      attempts[2]?.succeed();
      await flush();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'online']);
    });

    it('goes on asking regularly after it was offline and came back', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      await vi.advanceTimersByTimeAsync(15_000);
      attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      attempts[1]?.fail();
      await vi.advanceTimersByTimeAsync(2000);
      attempts[2]?.succeed();
      await flush();
      expect(probe).toHaveBeenCalledTimes(3);

      await vi.advanceTimersByTimeAsync(15_000);

      expect(probe).toHaveBeenCalledTimes(4);
    });

    it('does not ask while the browser says offline or while connecting', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });
      watch(store);

      goOffline();
      await vi.advanceTimersByTimeAsync(10_000);
      expect(probe).not.toHaveBeenCalled();

      goOnline(); // connecting: one probe, from the loop that looks for the internet
      expect(probe).toHaveBeenCalledTimes(1);
      attempts[0]?.fail();
      await flush();
      expect(store.getStatus()).toBe('connecting');
    });

    it('starts again after coming back from the network being gone', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });
      watch(store);
      goOffline();
      goOnline();
      attempts[0]?.succeed();
      await flush();
      expect(probe).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1000);

      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('does not ask while the page is open without a network, and starts when it is back', async () => {
      setNavigatorOnline(false);
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });
      watch(store);

      await vi.advanceTimersByTimeAsync(10_000);
      expect(probe).not.toHaveBeenCalled();

      goOnline();
      attempts[0]?.succeed();
      await flush();
      await vi.advanceTimersByTimeAsync(1000);

      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('is off when the delay is 0', async () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 0 });
      watch(store);

      await vi.advanceTimersByTimeAsync(3_600_000);

      expect(probe).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('stops when the last subscriber leaves', async () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });
      const { unsubscribe } = watch(store);

      unsubscribe();

      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(probe).not.toHaveBeenCalled();
    });

    it('stops when the browser says offline', async () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });
      watch(store);

      goOffline();

      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(probe).not.toHaveBeenCalled();
    });

    it('does not start on a tab nobody is looking at', async () => {
      showTab('hidden');
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 1000 });

      watch(store);

      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(probe).not.toHaveBeenCalled();
    });

    it('rests while the tab is hidden and asks at once when it is visible again', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);

      showTab('hidden');
      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(probe).not.toHaveBeenCalled();

      showTab('visible');
      expect(probe).toHaveBeenCalledTimes(1);
      attempts[0]?.succeed();
      await flush();
      await vi.advanceTimersByTimeAsync(15_000);
      expect(probe).toHaveBeenCalledTimes(2); // and it goes on from there
    });

    it('does not ask when a tab becomes visible and the regular check is off', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 0 });
      watch(store);

      showTab('visible');

      expect(probe).not.toHaveBeenCalled();
    });

    it('does not start over when a tab becomes visible while a failed check waits to be repeated', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      await vi.advanceTimersByTimeAsync(15_000);
      attempts[0]?.fail();
      await flush();

      showTab('visible');

      expect(probe).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('asks at once, instead of waiting out the delay, when a tab becomes visible while offline', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      await vi.advanceTimersByTimeAsync(15_000);
      attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      attempts[1]?.fail();
      await flush();
      expect(store.getStatus()).toBe('offline');
      expect(probe).toHaveBeenCalledTimes(2);

      showTab('visible');

      expect(probe).toHaveBeenCalledTimes(3);
      expect(store.getStatus()).toBe('offline'); // still offline, not "connecting"
      attempts[2]?.succeed();
      await flush();
      expect(store.getStatus()).toBe('online');
    });

    it('leaves no second loop behind when a tab becomes visible while offline', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      await vi.advanceTimersByTimeAsync(15_000);
      attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      attempts[1]?.fail();
      await flush(); // offline, the next try is due in 2s
      expect(probe).toHaveBeenCalledTimes(2);

      showTab('visible'); // asks at once: the old wait must be gone
      expect(probe).toHaveBeenCalledTimes(3);
      await vi.advanceTimersByTimeAsync(2000);

      expect(probe).toHaveBeenCalledTimes(3);
    });

    it('does not ask when a tab becomes visible and the browser says there is no network', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);

      setNavigatorOnline(false); // no event arrived
      showTab('visible');

      expect(store.getStatus()).toBe('offline');
      expect(probe).not.toHaveBeenCalled();
    });

    it('does not ask when a tab becomes visible while connecting', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      goOffline();
      goOnline();
      expect(probe).toHaveBeenCalledTimes(1);

      showTab('visible');

      expect(probe).toHaveBeenCalledTimes(1);
    });
  });

  describe('the default waits between tries', () => {
    it('are 0.5s, 1s, 2s and then 3s for every later one', async () => {
      const { probe, attempts } = createProbe();
      const store = createOnlineStatusStore({ probe, heartbeatMs: 0 });
      watch(store);
      goOffline();
      goOnline();

      for (const [index, delay] of [500, 1000, 2000, 3000, 3000, 3000].entries()) {
        attempts[index]?.fail();
        await flush();
        expect(probe).toHaveBeenCalledTimes(index + 1);

        await vi.advanceTimersByTimeAsync(delay - 1);
        expect(probe).toHaveBeenCalledTimes(index + 1);

        await vi.advanceTimersByTimeAsync(1);
        expect(probe).toHaveBeenCalledTimes(index + 2);
      }
    });

    it('make a failed check be repeated after half a second', async () => {
      const { probe, attempts } = createProbe();
      const store = createOnlineStatusStore({ probe, heartbeatMs: 0 });
      watch(store);

      store.recheck();
      attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(499);
      expect(probe).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      expect(probe).toHaveBeenCalledTimes(2);
    });
  });

  // A request that got an answer from the server is the best proof there is that the internet works.
  describe('a request that got an answer (confirmOnline)', () => {
    const goUnreachable = async (heartbeatMs = 15_000) => {
      const fake = createProbe();
      const store = createStore({ probe: fake.probe, heartbeatMs });
      const watched = watch(store);

      store.recheck();
      fake.attempts[0]?.fail();
      await vi.advanceTimersByTimeAsync(1000);
      fake.attempts[1]?.fail();
      await flush();

      return { ...fake, store, ...watched };
    };

    it('brings the status back to online at once when nothing answered before', async () => {
      const { store, seen, probe } = await goUnreachable();
      expect(store.getStatus()).toBe('offline');

      store.confirmOnline();

      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual(['offline', 'online']);
      // the loop that was looking for the internet is over
      await vi.advanceTimersByTimeAsync(2000);
      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('goes back to the regular check afterwards', async () => {
      const { store, probe } = await goUnreachable();
      store.confirmOnline();
      expect(probe).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(15_000);

      expect(probe).toHaveBeenCalledTimes(3);
    });

    it('turns connecting into online at once, and aborts the probe that was out', () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      const { seen } = watch(store);
      goOffline();
      goOnline();
      expect(store.getStatus()).toBe('connecting');

      store.confirmOnline();

      expect(store.getStatus()).toBe('online');
      expect(attempts[0]?.signal.aborted).toBe(true);
      expect(seen).toEqual(['offline', 'connecting', 'online']);
    });

    it('is ignored while the browser says there is no network, an answer can only come from a cache then', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      const { seen } = watch(store);
      goOffline();

      store.confirmOnline();

      expect(store.getStatus()).toBe('offline');
      expect(seen).toEqual(['offline']);
    });

    it('goes by what the browser says now: it is ignored when the network went and no event arrived yet', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      goOffline();
      goOnline(); // connecting, a probe is out
      expect(store.getStatus()).toBe('connecting');

      setNavigatorOnline(false); // the network is gone again, the event has not arrived
      store.confirmOnline();

      expect(store.getStatus()).toBe('connecting');
    });

    it('postpones the regular check, which only runs once nothing has got through for a while', async () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);

      for (let round = 0; round < 4; round += 1) {
        await vi.advanceTimersByTimeAsync(14_000);
        store.confirmOnline(); // the app is busy: something answers every 14s
      }
      expect(probe).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(14_999);
      expect(probe).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(probe).toHaveBeenCalledTimes(1);
    });

    it('keeps one timer however often it is told', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);

      for (let call = 0; call < 50; call += 1) store.confirmOnline();

      expect(vi.getTimerCount()).toBe(1);
    });

    it('drops a failed check that waits to be repeated: it was a blip', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      const { seen } = watch(store);
      await vi.advanceTimersByTimeAsync(15_000);
      attempts[0]?.fail();
      await flush(); // the repeat is due in 1s

      store.confirmOnline();
      await vi.advanceTimersByTimeAsync(1000);

      expect(probe).toHaveBeenCalledTimes(1); // no repeat
      expect(store.getStatus()).toBe('online');
      expect(seen).toEqual([]);
    });

    it('aborts a regular check that is out, the answer is better', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      await vi.advanceTimersByTimeAsync(15_000);
      expect(probe).toHaveBeenCalledTimes(1);

      store.confirmOnline();

      expect(attempts[0]?.signal.aborted).toBe(true);
      expect(store.getStatus()).toBe('online');
      await vi.advanceTimersByTimeAsync(15_000);
      expect(probe).toHaveBeenCalledTimes(2); // and the regular check goes on
    });

    it('does nothing with nobody subscribed', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });

      store.confirmOnline();

      expect(vi.getTimerCount()).toBe(0);
      expect(store.getStatus()).toBe('online');
    });

    it('starts no timer when the regular check is off', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 0 });
      watch(store);

      store.confirmOnline();

      expect(vi.getTimerCount()).toBe(0);
    });

    it('does not start one on a hidden tab', () => {
      const { probe } = createProbe();
      const store = createStore({ probe, heartbeatMs: 15_000 });
      watch(store);
      showTab('hidden');

      store.confirmOnline();

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('subscribers and cleanup', () => {
    const eventCalls = (spy: MockInstance, type: string) =>
      spy.mock.calls.filter(([name]) => name === type);

    it('listens to the browser only while somebody is subscribed', () => {
      const addWindow = vi.spyOn(window, 'addEventListener');
      const removeWindow = vi.spyOn(window, 'removeEventListener');
      const addDocument = vi.spyOn(document, 'addEventListener');
      const removeDocument = vi.spyOn(document, 'removeEventListener');
      const store = createStore();

      const first = subscribeToStore(store, () => undefined);
      const second = subscribeToStore(store, () => undefined);

      expect(eventCalls(addWindow, 'online')).toHaveLength(1);
      expect(eventCalls(addWindow, 'offline')).toHaveLength(1);
      expect(eventCalls(addDocument, 'visibilitychange')).toHaveLength(1);

      first();
      expect(eventCalls(removeWindow, 'online')).toHaveLength(0);

      second();
      expect(eventCalls(removeWindow, 'online')).toHaveLength(1);
      expect(eventCalls(removeWindow, 'offline')).toHaveLength(1);
      expect(eventCalls(removeDocument, 'visibilitychange')).toHaveLength(1);
      expect(eventCalls(removeWindow, 'online')[0]?.[1]).toBe(
        eventCalls(addWindow, 'online')[0]?.[1],
      );
      expect(eventCalls(removeWindow, 'offline')[0]?.[1]).toBe(
        eventCalls(addWindow, 'offline')[0]?.[1],
      );
      expect(eventCalls(removeDocument, 'visibilitychange')[0]?.[1]).toBe(
        eventCalls(addDocument, 'visibilitychange')[0]?.[1],
      );
    });

    it('stops everything, a probe in flight included, when the last subscriber leaves', async () => {
      const { probe, attempts } = createProbe();
      const store = createStore({ probe });
      const { unsubscribe } = watch(store);
      goOffline();
      goOnline();

      unsubscribe();

      expect(attempts[0]?.signal.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);

      attempts[0]?.succeed();
      await flush();
      goOffline(); // nobody is listening any more
      expect(vi.getTimerCount()).toBe(0);
    });

    it('starts again from what the browser says when somebody subscribes again', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      const { unsubscribe } = watch(store);
      goOffline();
      goOnline();
      expect(store.getStatus()).toBe('connecting');
      unsubscribe();

      const { seen } = watch(store);

      expect(store.getStatus()).toBe('online'); // the browser has a network; nothing is probing
      expect(seen).toEqual([]);
    });

    it('stays quiet about events that happen while nobody is subscribed', () => {
      const store = createStore();
      const { unsubscribe } = watch(store);
      unsubscribe();

      setNavigatorOnline(false);
      window.dispatchEvent(new Event('offline'));

      expect(store.getStatus()).toBe('offline'); // read live, not remembered
    });

    it('tells every subscriber, and each only while it is subscribed', () => {
      const store = createStore();
      const first = watch(store);
      const second = watch(store);

      goOffline();
      second.unsubscribe();
      goOnline();

      expect(first.seen).toEqual(['offline', 'connecting']);
      expect(second.seen).toEqual(['offline']);
    });

    it('copes with a listener that unsubscribes while being told', () => {
      const store = createStore();
      const calls: string[] = [];
      const unsubscribeFirst = subscribeToStore(store, () => {
        calls.push('first');
        unsubscribeFirst();
      });
      subscribeToStore(store, () => {
        calls.push('second');
      });

      goOffline();

      expect(calls).toEqual(['first', 'second']);
    });

    it('does not tell a listener that joins while everybody is being told about the same change', () => {
      const store = createStore();
      const late = vi.fn();
      let joined = false;
      subscribeToStore(store, () => {
        if (joined) return;

        joined = true;
        subscribeToStore(store, late);
      });

      goOffline();

      expect(late).not.toHaveBeenCalled();
      goOnline();
      expect(late).toHaveBeenCalledTimes(1);
    });

    it('can be rechecked again after it was stopped while a check was running', () => {
      const { probe } = createProbe();
      const store = createStore({ probe });
      const first = subscribeToStore(store, () => undefined);
      store.recheck();
      expect(probe).toHaveBeenCalledTimes(1);
      first(); // stops everything, the check that was out included

      subscribeToStore(store, () => undefined);
      store.recheck();

      expect(probe).toHaveBeenCalledTimes(2);
    });

    it('can be unsubscribed twice without harm', () => {
      const store = createStore();
      const keep = subscribeToStore(store, () => undefined);
      const leave = subscribeToStore(store, () => undefined);

      leave();
      leave();
      goOffline();

      expect(store.getStatus()).toBe('offline'); // still running for `keep`
      keep();
    });

    it('is independent from another store', () => {
      const one = createStore();
      const two = createStore();
      const { seen } = watch(one);

      goOffline();

      expect(seen).toEqual(['offline']);
      expect(two.getStatus()).toBe('offline'); // both read the same browser...
      const watched = watch(two);
      goOnline();
      expect(watched.seen).toEqual(['connecting']);
    });
  });

  describe('the default probe', () => {
    /** `fetch` that answers only when `reachable`, like a network that is up or down. */
    const network = (reachable: boolean, status = 204) => {
      const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
        reachable
          ? Promise.resolve(new Response(null, { status }))
          : Promise.reject(new TypeError('Failed to fetch')),
      );
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    };

    const probeOnce = async (store: OnlineStatusStore) => {
      watch(store);
      goOffline();
      goOnline();
      await flush();
    };

    it('asks only the site itself, with no cookies and nothing cached: never another company', async () => {
      const fetchMock = network(true);
      const store = createStore();

      await probeOnce(store);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toMatch(/^\/favicon\.ico\?online-check=\d+$/);
      expect(init.method).toBe('HEAD');
      expect(init.cache).toBe('no-store');
      expect(init.credentials).toBe('omit');
      expect(init.signal).toBeInstanceOf(AbortSignal);
      expect(store.getStatus()).toBe('online');
    });

    it('counts any answer, even an error page, as reachable', async () => {
      network(true, 404);
      const store = createStore();

      await probeOnce(store);

      expect(store.getStatus()).toBe('online');
    });

    it('counts no answer as unreachable, and asks again after a wait', async () => {
      const fetchMock = network(false);
      const store = createStore();

      await probeOnce(store);

      expect(store.getStatus()).toBe('connecting');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
