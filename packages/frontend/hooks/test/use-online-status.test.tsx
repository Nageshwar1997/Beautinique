import { act, cleanup, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { createOnlineStatusStore, type OnlineStatusStore } from '../src/online-status-store';
import { onlineStatusStore, useOnlineStatus } from '../src/use-online-status';

// The hook shares one store for the whole page, so these tests play the browser (the `onLine`
// property and its events) and the internet (`fetch`) and let the real store do its work.
let navigatorOnline: MockInstance<() => boolean>;

const setNavigatorOnline = (value: boolean) => {
  navigatorOnline.mockReturnValue(value);
};

const goOffline = () => {
  act(() => {
    setNavigatorOnline(false);
    window.dispatchEvent(new Event('offline'));
  });
};

const goOnline = () => {
  act(() => {
    setNavigatorOnline(true);
    window.dispatchEvent(new Event('online'));
  });
};

/** `fetch` that the test answers: `internet.up()` / `internet.down()` decide the next answers. */
const createInternet = () => {
  let reachable = true;
  // axios's fetch adapter hands over a whole Request
  const fetchMock = vi.fn<(input: Request | string) => Promise<Response>>(() =>
    reachable
      ? Promise.resolve(new Response(null, { status: 200 }))
      : Promise.reject(new TypeError('Failed to fetch')),
  );
  vi.stubGlobal('fetch', fetchMock);
  const pathOf = (input: Request | string) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    return `${url.pathname}${url.search}`;
  };

  return {
    fetchMock,
    /** How many times the internet was asked (the site itself, once per check). */
    probesStarted: () =>
      fetchMock.mock.calls.filter(([input]) =>
        pathOf(input).startsWith('/favicon.ico?online-check='),
      ).length,
    up: () => {
      reachable = true;
    },
    down: () => {
      reachable = false;
    },
  };
};

const settle = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

/** `renderHook`, also counting how often the component rendered. */
const renderStatus = (store?: OnlineStatusStore, options: { strict?: boolean } = {}) => {
  let renders = 0;
  const view = renderHook(
    () => {
      renders += 1;

      return useOnlineStatus(store);
    },
    options.strict ? { wrapper: StrictMode } : {},
  );

  return { ...view, renders: () => renders };
};

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigatorOnline = vi.spyOn(window.navigator, 'onLine', 'get');
    setNavigatorOnline(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('is online when the browser says it has a network', () => {
    const { result } = renderStatus();

    expect(result.current).toMatchObject({
      status: 'online',
      isOnline: true,
      isOffline: false,
      isConnecting: false,
    });
  });

  it('is offline from the very first render when the page opens without a network', () => {
    setNavigatorOnline(false);

    const { result, renders } = renderStatus();

    expect(result.current.status).toBe('offline');
    expect(result.current).toMatchObject({ isOnline: false, isOffline: true, isConnecting: false });
    expect(renders()).toBe(1); // no render with a wrong value first
  });

  it('follows the network: offline, then connecting while the internet has not answered, then online', async () => {
    const internet = createInternet();
    const { result } = renderStatus();

    goOffline();
    expect(result.current.status).toBe('offline');

    internet.down();
    goOnline();
    await settle();
    expect(result.current).toMatchObject({
      status: 'connecting',
      isOnline: false,
      isOffline: false,
      isConnecting: true,
    });

    internet.up();
    await advance(500); // the first retry
    expect(result.current).toMatchObject({ status: 'online', isOnline: true, isConnecting: false });
  });

  it('only renders again when the status really changes', () => {
    const { renders } = renderStatus();
    const rendersBefore = renders();

    act(() => {
      window.dispatchEvent(new Event('online')); // already online
    });

    expect(renders()).toBe(rendersBefore);
  });

  it('gives the same object while the status stays, and a new one when it changes', () => {
    const { result } = renderStatus();
    const first = result.current;

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(first);

    goOffline();
    expect(result.current).not.toBe(first);
  });

  it('gives the same object when only the component around it renders again', () => {
    const { result, rerender } = renderStatus();
    const first = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(first);
  });

  it('keeps `recheck` the same function for ever', () => {
    const { result } = renderStatus();
    const recheck = result.current.recheck;

    goOffline();

    expect(result.current.recheck).toBe(recheck);
    expect(recheck).toBe(onlineStatusStore.recheck);
  });

  it('shares one listener and one check between every component that uses it', async () => {
    const internet = createInternet();
    const add = vi.spyOn(window, 'addEventListener');
    const first = renderStatus();
    const second = renderStatus();

    expect(add.mock.calls.filter(([type]) => type === 'offline')).toHaveLength(1);

    goOffline();
    internet.down();
    goOnline();
    await settle();

    expect(first.result.current.status).toBe('connecting');
    expect(second.result.current.status).toBe('connecting');
    expect(internet.probesStarted()).toBe(1); // not one per component
  });

  it('asks the internet when told to recheck, and says offline when nothing answers twice', async () => {
    const internet = createInternet();
    const { result } = renderStatus();
    internet.down();

    act(() => {
      result.current.recheck();
    });
    await settle();

    expect(internet.probesStarted()).toBe(1);
    expect(result.current.status).toBe('online'); // once could be a blip

    await advance(500);

    expect(internet.probesStarted()).toBe(2);
    expect(result.current.status).toBe('offline');
  });

  it('notices the internet going away by itself, with the Wi-Fi still joined', async () => {
    const internet = createInternet();
    const { result } = renderStatus();
    expect(navigator.onLine).toBe(true);
    internet.down();

    await advance(15_000); // the regular check
    await advance(500); // its repeat

    expect(result.current).toMatchObject({ status: 'offline', isOffline: true });
    expect(navigator.onLine).toBe(true); // the browser never said a word

    internet.up();
    await advance(1000);

    expect(result.current.status).toBe('online');
  });

  it('can be rechecked from outside React', async () => {
    const internet = createInternet();
    const { result } = renderStatus();
    internet.down();

    act(() => {
      onlineStatusStore.recheck();
    });
    await advance(500);

    expect(result.current.status).toBe('offline');
  });

  it('is brought back to online by a request that got an answer, told from outside React', async () => {
    const internet = createInternet();
    const { result } = renderStatus();
    internet.down();
    await advance(15_000);
    await advance(500);
    expect(result.current.status).toBe('offline');

    act(() => {
      onlineStatusStore.confirmOnline(); // e.g. the API client got an answer
    });

    expect(result.current.status).toBe('online'); // the checks still get no answer
  });

  it('listens to the browser only while a component uses it, also under StrictMode', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const live = (type: string) =>
      add.mock.calls.filter(([name]) => name === type).length -
      remove.mock.calls.filter(([name]) => name === type).length;

    const { unmount } = renderStatus(undefined, { strict: true });
    expect(live('online')).toBe(1);
    expect(live('offline')).toBe(1);

    unmount();
    expect(live('online')).toBe(0);
    expect(live('offline')).toBe(0);
  });

  it('leaves nothing running after the last component is gone', async () => {
    const internet = createInternet();
    internet.down();
    const { unmount } = renderStatus();
    goOffline();
    goOnline();
    await settle();
    expect(vi.getTimerCount()).toBeGreaterThan(0); // retrying

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts again from the browser when a component mounts later', () => {
    const first = renderStatus();
    goOffline();
    first.unmount();
    goOnline(); // nobody is listening

    const second = renderStatus();

    expect(second.result.current.status).toBe('online');
  });

  describe('with a store of its own', () => {
    it('uses that store, and leaves the shared one alone', async () => {
      const add = vi.spyOn(window, 'addEventListener');
      const probe = vi.fn(() => Promise.resolve());
      const store = createOnlineStatusStore({ probe, heartbeatMs: 0 });

      const { result } = renderStatus(store);
      goOffline();
      goOnline();
      await settle();

      expect(result.current.status).toBe('online');
      expect(probe).toHaveBeenCalledTimes(1); // its own probe, not the default one
      expect(add.mock.calls.filter(([type]) => type === 'online')).toHaveLength(1);
      expect(onlineStatusStore.getStatus()).toBe('online'); // the shared store has nobody subscribed
    });

    it('gives the recheck of that store', async () => {
      const probe = vi.fn(() => Promise.reject(new Error('no answer')));
      const store = createOnlineStatusStore({ probe, heartbeatMs: 0 });
      const { result } = renderStatus(store);

      expect(result.current.recheck).toBe(store.recheck);
      act(() => {
        result.current.recheck();
      });
      await advance(500);

      expect(probe).toHaveBeenCalledTimes(2);
      expect(result.current.status).toBe('offline');
    });

    it('moves to another store when it is given one, and lets go of the old one', () => {
      const first = createOnlineStatusStore({ heartbeatMs: 0 });
      const second = createOnlineStatusStore({ heartbeatMs: 0 });
      const add = vi.spyOn(window, 'addEventListener');
      const remove = vi.spyOn(window, 'removeEventListener');
      const { result, rerender } = renderHook(
        ({ store }: { store: OnlineStatusStore }) => useOnlineStatus(store),
        { initialProps: { store: first } },
      );
      const recheckOfFirst = result.current.recheck;

      rerender({ store: second });

      expect(result.current.recheck).toBe(second.recheck);
      expect(result.current.recheck).not.toBe(recheckOfFirst);
      const live = (type: string) =>
        add.mock.calls.filter(([name]) => name === type).length -
        remove.mock.calls.filter(([name]) => name === type).length;
      expect(live('offline')).toBe(1); // one store listens, not both
    });
  });

  describe('on a server', () => {
    const Probe = () => <span>{useOnlineStatus().status}</span>;

    it('always renders online, because a server cannot know', () => {
      setNavigatorOnline(false);

      expect(renderToString(<Probe />)).toContain('online');
      expect(renderToString(<Probe />)).not.toContain('offline');
    });

    it('hydrates the server markup, then shows the real status without complaining', () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const container = document.createElement('div');
      document.body.append(container);
      container.innerHTML = renderToString(<Probe />); // `online`, as a server renders it
      setNavigatorOnline(false);

      let root: ReturnType<typeof hydrateRoot> | undefined;
      act(() => {
        root = hydrateRoot(container, <Probe />);
      });

      expect(container.textContent).toBe('offline');
      expect(errors).not.toHaveBeenCalled();

      act(() => {
        root?.unmount();
      });
    });
  });
});
