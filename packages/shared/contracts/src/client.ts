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

export interface ClientOptions {
  /** Origin and optional prefix of the gateway, e.g. `https://api.beautinique.example`. */
  baseUrl: string;
  /** Sent as `X-BQ-App` on every request. */
  app: AppId;
  fetch?: typeof fetch;
  /** The access token to send as a Bearer token, or null when signed out. */
  getToken?: () => string | null | Promise<string | null>;
  /** Check each `data` against the route's output schema (default true). */
  validateResponses?: boolean;
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

/** Parses an error response; a body that is not our error body still becomes an ApiError. */
async function failure(response: Response): Promise<ApiError> {
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = undefined;
  }
  const parsed = errorBody.safeParse(json);
  if (parsed.success) {
    const { code, message, details, requestId } = parsed.data.error;
    return new ApiError({ code, message, status: response.status, requestId, details });
  }
  return new ApiError({
    code: response.status >= 500 ? 'INTERNAL' : 'BAD_REQUEST',
    message: `Request failed with status ${String(response.status)}`,
    status: response.status,
    requestId: response.headers.get(HEADERS.requestId),
  });
}

/**
 * The typed client (ARCHITECTURE §5.1): `client.call(route, { params, query, body })` returns the
 * route's `data` type, or throws an ApiError. Apps use only this, never `fetch` directly.
 */
export function createClient(options: ClientOptions) {
  const doFetch = options.fetch ?? fetch;
  const base = options.baseUrl.replace(/\/+$/, '');
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
    const headers: Record<string, string> = {
      Accept: 'application/json',
      [HEADERS.app]: options.app,
    };
    const token = await options.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (route.idempotency) {
      headers[HEADERS.idempotencyKey] = callOptions?.idempotencyKey ?? crypto.randomUUID();
    }
    let body: string | undefined;
    if (route.input.body) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(input.body);
    }
    let response: Response;
    try {
      response = await doFetch(
        `${base}${buildPath(route.path, input.params)}${queryString(input.query)}`,
        { method: route.method, headers, body, signal: callOptions?.signal },
      );
    } catch (error) {
      if (callOptions?.signal?.aborted) throw error;
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'The server could not be reached',
        status: 0,
      });
    }
    if (!response.ok) throw await failure(response);
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      json = undefined;
    }
    const data = (json as { data?: unknown } | undefined)?.data;
    if (data === undefined) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: 'The server sent a response without data',
        status: response.status,
        requestId: response.headers.get(HEADERS.requestId),
      });
    }
    if (!validate) return data as RouteOutput<Route>;
    const parsed = route.output.safeParse(data);
    if (!parsed.success) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: `The response does not match ${route.id}`,
        status: response.status,
        requestId: response.headers.get(HEADERS.requestId),
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
