import { type OnlineStatusStore, onlineStatusStore } from '@beautinique/frontend-hooks';
import {
  ApiError,
  type AppId,
  buildPath,
  type CallArgs,
  type CallOptions,
  errorBody,
  HEADERS,
  refreshSession,
  type RouteDefinition,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponse, isAxiosError } from 'axios';

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

/** Query values as the gateway reads them (like the contracts' client): a name per list item, ISO dates. */
function queryString(query: unknown): string {
  if (typeof query !== 'object' || query === null) return '';
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? (value as unknown[]) : [value]) {
      if (item === undefined || item === null) continue;
      search.append(name, item instanceof Date ? item.toISOString() : String(item));
    }
  }
  const text = search.toString();
  return text === '' ? '' : `?${text}`;
}

/**
 * What a failed request becomes: the caller's own abort as the signal gave it, our error body as
 * an ApiError, any other answer by its status, and no answer at all as NETWORK_ERROR.
 */
function failure(error: unknown, signal: AbortSignal | undefined): unknown {
  if (signal?.aborted === true) return signal.reason;
  if (!isAxiosError(error)) return error;
  const { response } = error;
  if (response === undefined) {
    return new ApiError({
      code: 'NETWORK_ERROR',
      message: 'The server could not be reached',
      status: 0,
    });
  }
  const parsed = errorBody.safeParse(response.data);
  if (parsed.success) {
    const { code, message, details, requestId } = parsed.data.error;
    return new ApiError({ code, message, status: response.status, requestId, details });
  }
  return new ApiError({
    code: response.status >= 500 ? 'INTERNAL' : 'BAD_REQUEST',
    message: `Request failed with status ${String(response.status)}`,
    status: response.status,
    requestId: requestIdOf(response.headers),
  });
}

function requestIdOf(headers: AxiosResponse['headers']): string | null {
  // axios answers with AxiosHeaders, whose get() ignores the name's case
  const value: unknown =
    headers instanceof AxiosHeaders
      ? headers.get(HEADERS.requestId)
      : headers[HEADERS.requestId.toLowerCase()];
  return typeof value === 'string' ? value : null;
}

interface Transport {
  http: AxiosInstance;
  validate: boolean;
  online: Pick<OnlineStatusStore, 'confirmOnline' | 'recheck'>;
}

/**
 * One request of a contract route over axios: the path and query from the route, the body only
 * where the route has one, and the answer's `data` checked against the route's output schema.
 */
async function send<const Route extends RouteDefinition>(
  { http, validate, online }: Transport,
  route: Route,
  request: unknown,
  callOptions: CallOptions,
): Promise<RouteOutput<Route>> {
  const input = (request ?? {}) as {
    params?: Record<string, string | number>;
    query?: unknown;
    body?: unknown;
  };
  const headers: Record<string, string> = {};
  if (callOptions.idempotencyKey !== undefined) {
    headers[HEADERS.idempotencyKey] = callOptions.idempotencyKey;
  }
  let answer: unknown;
  let answerHeaders: AxiosResponse['headers'];
  let status: number;
  try {
    const response = await http.request<unknown>({
      method: route.method,
      url: `${buildPath(route.path, input.params)}${queryString(input.query)}`,
      data: route.input.body ? input.body : undefined,
      headers,
      signal: callOptions.signal,
    });
    answer = response.data;
    answerHeaders = response.headers;
    status = response.status;
  } catch (error) {
    if (callOptions.signal?.aborted !== true && isAxiosError(error)) {
      if (error.response === undefined) online.recheck();
      else online.confirmOnline();
    }
    throw failure(error, callOptions.signal);
  }
  online.confirmOnline();
  const data =
    typeof answer === 'object' && answer !== null ? (answer as { data?: unknown }).data : undefined;
  if (data === undefined) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'The server sent a response without data',
      status,
      requestId: requestIdOf(answerHeaders),
    });
  }
  if (!validate) return data as RouteOutput<Route>;
  const parsed = route.output.safeParse(data);
  if (!parsed.success) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: `The response does not match ${route.id}`,
      status,
      requestId: requestIdOf(answerHeaders),
    });
  }
  return parsed.data as RouteOutput<Route>;
}

/**
 * The app's one client (ARCHITECTURE §9.2): contract routes through the gateway, over axios, with
 * the app's HttpOnly cookies, which the page never sees.
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const http = axios.create({
    baseURL: options.baseUrl ?? API_BASE_URL,
    headers: { Accept: 'application/json', [HEADERS.app]: options.app },
    ...(options.fetch === undefined ? {} : { adapter: 'fetch', env: { fetch: options.fetch } }),
  });
  const transport: Transport = {
    http,
    validate: options.validateResponses ?? true,
    online: options.onlineStatus ?? onlineStatusStore,
  };
  const inner = {
    call: <const Route extends RouteDefinition>(
      route: Route,
      request?: unknown,
      callOptions: CallOptions = {},
    ) => send(transport, route, request, callOptions),
  };

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
    const sendOnce = () => inner.call(route, request, sendOptions);

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
