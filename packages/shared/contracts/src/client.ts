import type { input, output, ZodType } from 'zod';

import type { HttpMethod } from './constants/http-methods.ts';
import { errorBodySchema } from './error-codes.ts';
import type { AnyRoute } from './route.ts';

/** The header that carries the idempotency key (docs/ARCHITECTURE.md §5 rule 10). */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** A request, ready to send: the path (with the query), the headers and the JSON body. */
export interface ClientRequest {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

/** What comes back: the status, and the body already read as JSON (or `undefined` when there is none). */
export interface ClientResponse {
  status: number;
  body: unknown;
}

/** Sends a request. The app gives it: `fetch`, with the timeout, the retry and the app version header. */
export type Transport = (request: ClientRequest) => Promise<ClientResponse>;

/** An error answer of the server, in the one shape of docs/ARCHITECTURE.md §5 rule 8. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId: string | undefined;

  constructor(status: number, code: string, message: string, details: unknown, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export interface RequestOptions {
  /** The key of a route with `idempotency: 'required'`. A new key for a new action, the same one for a retry of it. */
  idempotencyKey?: string;
}

type Part = 'params' | 'query' | 'body';

// A part whose fields may all be left out (a list with only optional filters) can be left out too.
type Optional<C extends AnyRoute, K extends Part> = C[K] extends ZodType
  ? Partial<input<C[K]>> extends input<C[K]>
    ? true
    : false
  : false;

/**
 * What the caller gives: the parts the route has (`params`, `query`, `body`), in their input
 * types. A part is needed unless all its fields may be left out.
 */
export type RouteInput<C extends AnyRoute> = {
  [K in Part as C[K] extends ZodType ? (Optional<C, K> extends true ? never : K) : never]: input<
    C[K]
  >;
} & {
  [K in Part as Optional<C, K> extends true ? K : never]?: input<C[K]>;
};

/** What a success gives: the response of the route, as its schema reads it. */
export type RouteOutput<C extends AnyRoute> = output<C['response']>;

/** The function of one route: the input is not needed when the route has no parts. */
export type ClientMethod<C extends AnyRoute> =
  Partial<RouteInput<C>> extends RouteInput<C>
    ? (input?: RouteInput<C>, options?: RequestOptions) => Promise<RouteOutput<C>>
    : (input: RouteInput<C>, options?: RequestOptions) => Promise<RouteOutput<C>>;

export type Client<Routes extends Readonly<Record<string, AnyRoute>>> = {
  readonly [K in keyof Routes]: ClientMethod<Routes[K]>;
};

// The text of one query value: nothing for `undefined` and `null`, ISO for a date.
function queryValue(item: unknown): string | undefined {
  if (item === undefined || item === null) return undefined;
  if (item instanceof Date) return item.toISOString();
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
    return String(item);
  }
  throw new RangeError('A value of the query is text, a number, a boolean or a date.');
}

// `a=1&a=2` for a list, in the order of the keys, so the same input is always the same URL.
function queryString(query: Readonly<Record<string, unknown>>): string {
  const pairs: string[] = [];
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    for (const item of Array.isArray(value) ? (value as unknown[]) : [value]) {
      const text = queryValue(item);
      if (text !== undefined) pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(text)}`);
    }
  }
  return pairs.length === 0 ? '' : `?${pairs.join('&')}`;
}

/**
 * The request of a route for an input. The input is checked with the route's own schemas, so a
 * wrong one stops here and not on the server; the path parts and the query are written into the
 * URL, the body is JSON, and a route that asks for an idempotency key must be given one.
 */
export function buildRequest(
  route: AnyRoute,
  given: { params?: unknown; query?: unknown; body?: unknown } = {},
  options: RequestOptions = {},
): ClientRequest {
  const params = (route.params?.parse(given.params ?? {}) ?? {}) as Record<string, unknown>;
  const query = (route.query?.parse(given.query ?? {}) ?? {}) as Record<string, unknown>;
  const path = route.path.replaceAll(/:([A-Za-z][A-Za-z0-9]*)/g, (_, name: string) =>
    encodeURIComponent(String(params[name])),
  );
  const headers: Record<string, string> = {};
  if (route.idempotency === 'required') {
    if (options.idempotencyKey === undefined || options.idempotencyKey === '') {
      throw new RangeError(`The route ${route.id} needs an idempotency key.`);
    }
    headers[IDEMPOTENCY_HEADER] = options.idempotencyKey;
  }
  const request: ClientRequest = {
    method: route.method,
    url: `${path}${queryString(query)}`,
    headers,
  };
  if (route.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    request.body = JSON.stringify(route.body.parse(given.body));
  }
  return request;
}

/**
 * The base of the typed client: one function per route, with the input and the answer typed from
 * the contract. It builds the request, sends it through `transport`, and reads the answer: an error
 * answer becomes an `ApiError`, and a success is checked with the route's response schema. The
 * retry, the timeout, the app version header and the query keys are the app client's own.
 */
export function createClient<const Routes extends Readonly<Record<string, AnyRoute>>>(
  routes: Routes,
  transport: Transport,
): Client<Routes> {
  const entries = Object.entries(routes).map(([name, route]) => {
    const call = async (
      given?: { params?: unknown; query?: unknown; body?: unknown },
      options?: RequestOptions,
    ) => {
      const response = await transport(buildRequest(route, given, options));
      if (response.status >= 400) throw toApiError(response);
      return route.status === 204 ? undefined : route.response.parse(response.body);
    };
    return [name, call] as const;
  });
  return Object.freeze(Object.fromEntries(entries)) as never;
}

function toApiError(response: ClientResponse): ApiError {
  const parsed = errorBodySchema.safeParse(response.body);
  if (!parsed.success) {
    return new ApiError(
      response.status,
      'INTERNAL',
      'The server answered with something unexpected.',
      undefined,
    );
  }
  const { code, message, details, requestId } = parsed.data.error;
  return new ApiError(response.status, code, message, details, requestId);
}
