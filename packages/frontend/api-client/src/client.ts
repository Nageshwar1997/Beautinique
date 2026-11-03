import { type OnlineStatusStore, onlineStatusStore } from '@beautinique/frontend-hooks';
import {
  type ApiError,
  type AppId,
  type CallArgs,
  type CallOptions,
  createClient,
  refreshSession,
  type RouteDefinition,
  type RouteOutput,
} from '@beautinique/shared-contracts';

import { isApiError } from './errors';

/** Every app reaches the gateway on its own host: `/api` goes through Vercel (ARCHITECTURE §7.2). */
export const API_BASE_URL = '/api/v1';

/**
 * How long a refresh waits after another tab refreshed the same session a moment earlier (409):
 * that tab's answer sets the new cookies, which this tab shares.
 */
export const OTHER_TAB_REFRESH_WAIT_MS = 300;

/** What a session did: told to the app's listeners, and to its other tabs when the app says so. */
export type SessionChange = 'signed-in' | 'signed-out';

/**
 * Asked when a route wants a recent step-up (STEP_UP_REQUIRED): resolves true once the person
 * proved it with the authenticator, false when they cancelled.
 */
export type StepUpHandler = (error: ApiError) => Promise<boolean>;

export interface ApiClientOptions {
  /** Sent as `X-BQ-App` with every request. */
  app: AppId;
  /** Default `/api/v1`, on the app's own host. */
  baseUrl?: string;
  /**
   * Send through this fetch (axios's fetch adapter) instead of axios's default (XMLHttpRequest in
   * the browser, `http` on a server): tests, or a server that brings its own fetch.
   */
  fetch?: typeof fetch;
  /** Check each answer against the route's output schema (default true). */
  validateResponses?: boolean;
  /**
   * Told about every request: an answer proves the internet works, no answer is worth a check
   * (default: the hooks package's shared `onlineStatusStore`, which `useOnlineStatus` reads).
   */
  onlineStatus?: Pick<OnlineStatusStore, 'confirmOnline' | 'recheck'>;
}

export interface ApiClient {
  readonly app: AppId;
  /**
   * `call(route, { params, query, body })`: the route's `data`, or an ApiError. An ended access
   * token is refreshed once and the call sent again; a route that wants a step-up asks the step-up
   * handler first. Every try of one call sends the same Idempotency-Key.
   */
  call<const Route extends RouteDefinition>(
    route: Route,
    ...args: CallArgs<Route>
  ): Promise<RouteOutput<Route>>;
  /**
   * A new access token with the refresh cookie, one at a time: callers during a refresh share it.
   * false when there is no session any more; other failures (offline, server down) throw.
   */
  refresh(): Promise<boolean>;
  /** Who answers STEP_UP_REQUIRED (the auth-ui dialog); the returned function removes it again. */
  setStepUpHandler(handler: StepUpHandler): () => void;
  /** Hear sign-ins and sign-outs: this tab's, its failed refreshes, and the other tabs' of this app. */
  onSessionChange(listener: (change: SessionChange) => void): () => void;
  /** The app signed in or out: tell this tab's listeners and the app's other tabs. */
  sessionChanged(change: SessionChange): void;
  /** Stops listening to the other tabs (tests, or an app that is torn down). */
  dispose(): void;
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * The app's one client (ARCHITECTURE §9.2): contract routes through the gateway with the contracts'
 * axios client and the app's HttpOnly cookies, which the page never sees.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const online = options.onlineStatus ?? onlineStatusStore;
  const inner = createClient({
    baseUrl: options.baseUrl ?? API_BASE_URL,
    app: options.app,
    fetch: options.fetch,
    validateResponses: options.validateResponses,
    onNetwork: (event) => {
      if (event === 'answered') online.confirmOnline();
      else online.recheck();
    },
  });

  const listeners = new Set<(change: SessionChange) => void>();
  const notify = (change: SessionChange) => {
    for (const listener of listeners) listener(change);
  };

  let channel: BroadcastChannel | undefined;
  const openChannel = () => {
    if (channel !== undefined) return;
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    channel = new BroadcastChannel(`bq:${options.app}:session`);
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (event.data === 'signed-in' || event.data === 'signed-out') notify(event.data);
    };
  };

  let refreshing: Promise<boolean> | null = null;
  const runRefresh = async (): Promise<boolean> => {
    try {
      await inner.call(refreshSession);
      return true;
    } catch (error) {
      if (isApiError(error, 'REFRESH_IN_PROGRESS')) {
        // Another tab refreshed this session a moment ago, and its new cookies are this tab's too.
        // Asking again with the old refresh token would look like a stolen one (ARCHITECTURE §7.2).
        await delay(OTHER_TAB_REFRESH_WAIT_MS);
        return true;
      }
      if (isApiError(error, 'SESSION_EXPIRED')) {
        // only this tab: another tab may have signed in a moment ago, each finds out with its own calls
        notify('signed-out');
        return false;
      }
      throw error;
    }
  };
  const refresh = (): Promise<boolean> => {
    refreshing ??= runRefresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  let stepUpHandler: StepUpHandler | null = null;
  let steppingUp: Promise<boolean> | null = null;
  const stepUp = (handler: StepUpHandler, error: ApiError): Promise<boolean> => {
    // calls that want a step-up together get one dialog
    steppingUp ??= handler(error).finally(() => {
      steppingUp = null;
    });
    return steppingUp;
  };

  async function call<const Route extends RouteDefinition>(
    route: Route,
    ...[request, callOptions]: CallArgs<Route>
  ): Promise<RouteOutput<Route>> {
    // one key for every try, so a call sent again after a refresh or a step-up is the same request
    const sendOptions: CallOptions = route.idempotency
      ? { ...callOptions, idempotencyKey: callOptions?.idempotencyKey ?? crypto.randomUUID() }
      : { ...callOptions };
    const sendOnce = () => inner.call(route, ...([request, sendOptions] as CallArgs<Route>));

    // a call asked for during a refresh waits for it, instead of going out with the old cookie
    if (refreshing !== null) await refreshing.catch(() => false);

    let refreshed = false;
    let steppedUp = false;
    for (;;) {
      try {
        return await sendOnce();
      } catch (error) {
        if (isApiError(error, 'UNAUTHENTICATED') && !refreshed) {
          refreshed = true;
          if (await refresh()) continue;
          throw error;
        }
        const handler = stepUpHandler;
        if (isApiError(error, 'STEP_UP_REQUIRED') && !steppedUp && handler !== null) {
          steppedUp = true;
          if (await stepUp(handler, error)) continue;
        }
        throw error;
      }
    }
  }

  return {
    app: options.app,
    call,
    refresh,
    setStepUpHandler(handler) {
      stepUpHandler = handler;
      return () => {
        if (stepUpHandler === handler) stepUpHandler = null;
      };
    },
    onSessionChange(listener) {
      openChannel();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    sessionChanged(change) {
      notify(change);
      openChannel();
      channel?.postMessage(change);
    },
    dispose() {
      listeners.clear();
      channel?.close();
      channel = undefined;
    },
  };
}
