import { useMemo, useSyncExternalStore } from 'react';

import {
  type ConnectionStatus,
  createOnlineStatusStore,
  type OnlineStatusStore,
} from './online-status-store';

/**
 * The online status of the page: one store shared by every `useOnlineStatus()` that is not given a
 * store of its own, and by code outside React. Nothing runs (no listener, timer or request) while
 * nobody is subscribed to it, so merely importing it costs nothing.
 *
 * For code outside React, e.g. an API client:
 * - `onlineStatusStore.confirmOnline()` when the server answered a request (any answer),
 * - `onlineStatusStore.recheck()` when a request got no answer at all,
 * - `onlineStatusStore.subscribe(listener)` / `onlineStatusStore.getStatus()` to follow the status.
 */
export const onlineStatusStore: OnlineStatusStore = createOnlineStatusStore();

// A server cannot know. Assuming online means a page that is rendered there never starts with an
// "offline" message, and the real status replaces it right after hydration.
const getServerStatus = (): ConnectionStatus => 'online';

export interface OnlineStatus {
  /** `online`, `offline` (no network, or the internet stopped answering) or `connecting` (the network is back, the internet has not answered yet). */
  status: ConnectionStatus;
  isOnline: boolean;
  isOffline: boolean;
  isConnecting: boolean;
  /** `recheck()` of the store this is about. Keeps its identity for as long as the store stays the same. */
  recheck: () => void;
}

/**
 * Whether the user can reach the internet, kept up to date while the component is mounted.
 *
 * - The browser's `online` / `offline` events are one trigger. When the network comes back the status
 *   is `connecting` until a real request gets an answer, because "the network interface is up" does
 *   not mean "the internet works" (Wi-Fi joined, no data yet).
 * - The browser says nothing when the Wi-Fi has no internet behind it (a phone hotspot with its data
 *   off), so while online and visible the internet is also asked every 15 seconds (see
 *   `heartbeatMs` of `createOnlineStatusStore`). Two checks in a row without an answer make it
 *   `offline`; the first answer makes it `online` again.
 * - Every component that uses it shares one listener and one check.
 * - The first render is already right (no flash of the wrong status), and a server always says
 *   `online`.
 * - Nothing runs while no component uses it.
 *
 * The status is also better informed by the app's own requests: call
 * `onlineStatusStore.confirmOnline()` when the server answered one, and `onlineStatusStore.recheck()`
 * when one got no answer (see {@link onlineStatusStore}). With TanStack Query, feed the status to its
 * `onlineManager` so queries wait instead of failing while there is no internet.
 *
 * @param store - Where the status comes from. Pass a store made with `createOnlineStatusStore()` (and
 * created once, outside of the component) to use another probe URL, check interval or waits between
 * tries. @default onlineStatusStore
 */
export const useOnlineStatus = (store: OnlineStatusStore = onlineStatusStore): OnlineStatus => {
  const status = useSyncExternalStore(store.subscribe, store.getStatus, getServerStatus);

  return useMemo(
    () => ({
      status,
      isOnline: status === 'online',
      isOffline: status === 'offline',
      isConnecting: status === 'connecting',
      recheck: store.recheck,
    }),
    [status, store],
  );
};
