import axios, { AxiosHeaders, type AxiosResponse } from 'axios';

import { errorBody } from './http';
import type { AppId } from './platform';
import { HEADERS } from './platform';
import type { RouteDefinition, RouteOutput, RouteRequest } from './routes';
import { buildPath } from './routes';

/** A failed call: an error body from the server, or a problem the client found itself. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId: string | null;
  readonly details: readonly { path: readonly (string | number)[]; message: string }[];

  constructor(init: {
    code: string;
    message: string;
    status: number;
    requestId?: string | null;
    details?: readonly { path: readonly (string | number)[]; message: string }[];
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.code = init.code;
    this.status = init.status;
    this.requestId = init.requestId ?? null;
    this.details = init.details ?? [];
  }
}

/** What a request found out about the connection: the server answered (an error too), or nothing came back. */
export type NetworkEvent = 'answered' | 'unanswered';

export interface ClientOptions {
  /** Origin and optional prefix of the gateway, e.g. `https://api.beautinique.example`. */
  baseUrl: string;
  /** Sent as `X-BQ-App` on every request. */
  app: AppId;
  /**
   * Send through this fetch, with axios's fetch adapter, instead of axios's own default
   * (XMLHttpRequest in a browser, `http` on a server). The fetch gets a whole Request, so outside a
   * browser `baseUrl` must then be a whole URL.
   */
  fetch?: typeof fetch;
  /** The access token to send as a Bearer token, or null when signed out. */
  getToken?: () => string | null | Promise<string | null>;
  /** Check each `data` against the route's output schema (default true). */
  validateResponses?: boolean;
  /** Told after every request, never for the caller's own abort (the apps' online status). */
  onNetwork?: (event: NetworkEvent) => void;
}

export interface CallOptions {
  signal?: AbortSignal;
  /** Reuse the same key to retry a request; a fresh one is made when omitted. */
  idempotencyKey?: string;
}

type Defined<Request> = {
  [Key in keyof Request as undefined extends Request[Key] ? never : Key]: Request[Key];
};

/** `call(route, request, options)`: the request is required only when the route has input. */
export type CallArgs<Route extends RouteDefinition> = keyof Defined<
  RouteRequest<Route>
> extends never
  ? [request?: undefined, options?: CallOptions]
  : [request: Defined<RouteRequest<Route>>, options?: CallOptions];

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

function requestIdOf(headers: AxiosResponse['headers']): string | null {
  // axios answers with AxiosHeaders, whose get() ignores the name's case
  const value: unknown =
    headers instanceof AxiosHeaders
      ? headers.get(HEADERS.requestId)
      : headers[HEADERS.requestId.toLowerCase()];
  return typeof value === 'string' ? value : null;
}

/** Parses an error response; a body that is not our error body still becomes an ApiError. */
function failure(response: AxiosResponse<unknown>): ApiError {
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

/**
 * The typed client (ARCHITECTURE §5.1), over axios: `client.call(route, { params, query, body })`
 * returns the route's `data` type, or throws an ApiError. Apps use only this (through
 * `@beautinique/frontend-api-client`), never axios directly.
 */
export function createClient(options: ClientOptions) {
  const http = axios.create({
    baseURL: options.baseUrl.replace(/\/+$/, ''),
    headers: { Accept: 'application/json', [HEADERS.app]: options.app },
    // every answer comes back here; its status decides below
    validateStatus: () => true,
    ...(options.fetch === undefined ? {} : { adapter: 'fetch', env: { fetch: options.fetch } }),
  });
  const validate = options.validateResponses ?? true;

  async function call<const Route extends RouteDefinition>(
    route: Route,
    ...[request, callOptions]: CallArgs<Route>
  ): Promise<RouteOutput<Route>> {
    const input = (request ?? {}) as {
      params?: Record<string, string | number>;
      query?: unknown;
      body?: unknown;
    };
    // false keeps axios from calling a POST without a body a form
    const headers: Record<string, string | false> = { 'Content-Type': false };
    const token = await options.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (route.idempotency) {
      headers[HEADERS.idempotencyKey] = callOptions?.idempotencyKey ?? crypto.randomUUID();
    }
    let payload: string | undefined;
    if (route.input.body) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(input.body);
    }
    const url = `${buildPath(route.path, input.params)}${queryString(input.query)}`;
    let response: AxiosResponse<unknown>;
    try {
      response = await http.request<unknown>({
        method: route.method,
        url,
        headers,
        data: payload,
        signal: callOptions?.signal,
      });
    } catch {
      // the caller's own abort comes back as the signal gives it, like fetch's
      if (callOptions?.signal?.aborted) throw callOptions.signal.reason;
      options.onNetwork?.('unanswered');
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'The server could not be reached',
        status: 0,
      });
    }
    options.onNetwork?.('answered');
    if (response.status < 200 || response.status > 299) throw failure(response);
    const answer = response.data;
    const data =
      typeof answer === 'object' && answer !== null
        ? (answer as { data?: unknown }).data
        : undefined;
    if (data === undefined) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: 'The server sent a response without data',
        status: response.status,
        requestId: requestIdOf(response.headers),
      });
    }
    if (!validate) return data as RouteOutput<Route>;
    const parsed = route.output.safeParse(data);
    if (!parsed.success) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: `The response does not match ${route.id}`,
        status: response.status,
        requestId: requestIdOf(response.headers),
      });
    }
    return parsed.data as RouteOutput<Route>;
  }

  return { call };
}

export type Client = ReturnType<typeof createClient>;

/** TanStack Query key of a read: `[module, route.id, { params, query }]`. The body is never part of a key. */
export function queryKey(route: RouteDefinition, request?: { params?: unknown; query?: unknown }) {
  return [
    route.id.split('.')[0] ?? route.id,
    route.id,
    { params: request?.params ?? null, query: request?.query ?? null },
  ] as const;
}

/** Key prefix that matches every read of a module (`['catalog']`) or of one route (`['catalog', 'catalog.products.list']`). */
export function queryKeyPrefix(module: string, routeId?: string) {
  return routeId === undefined ? [module] : [module, routeId];
}
