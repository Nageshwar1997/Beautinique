import { strictObject, type ZodType } from 'zod';

import type { App } from './constants/apps.ts';
import type { HttpMethod } from './constants/http-methods.ts';
import type { RateLimitClass } from './constants/rate-limit-classes.ts';
import { SERVICES, type Service } from './constants/services.ts';
import type { ErrorStatus } from './error-codes.ts';
import type { PermissionDefinition } from './permission.ts';

/** The fields of a request part. The package wraps them in a strict object, so an unknown field is refused. */
export type Shape = Readonly<Record<string, ZodType>>;

type StrictObject<S extends Shape> = ReturnType<typeof strictObject<S>>;
type SchemaOf<S extends Shape | undefined> = S extends Shape ? StrictObject<S> : undefined;

export type RouteStatus = 200 | 201 | 202 | 204;

export interface RouteDefinition<
  P extends Shape | undefined,
  Q extends Shape | undefined,
  B extends Shape | undefined,
  R extends ZodType,
> {
  /** `<service>.<resource>.<action>`, like `commerce.order.place`: the name of the route, one of a kind. */
  id: `${Service}.${string}.${string}`;
  method: HttpMethod;
  /** `/api/v1/<service>/...`, with `:name` for a part that changes (docs/ARCHITECTURE.md §5 rule 1). */
  path: `/api/v1/${Service}/${string}`;
  /** One line for the OpenAPI document. */
  summary: string;
  /** The apps whose token may call it (SR-035). */
  apps: readonly [App, ...App[]];
  /** The permission it asks for, or `'public'`: a route that is not marked public is 401 without a session (SR-032). */
  permission: PermissionDefinition | 'public';
  rateLimit: RateLimitClass;
  /** `required`: the caller sends an idempotency key (SR-045). Only for a route that writes. */
  idempotency?: 'required' | 'none';
  /** A public GET that a cache may keep. */
  cache?: { maxAgeSeconds: number };
  /** The parts of the path that change. They are the `:name` of the path, no more, no less. */
  params?: P;
  query?: Q;
  /** The JSON body (not for a GET). */
  body?: B;
  /** What a success answers. */
  response: R;
  /** The status of a success (200 if not told). A 204 has no body. */
  status?: RouteStatus;
  /** The errors, besides the common ones, that this route can answer with. */
  errors?: Readonly<Record<string, ErrorStatus>>;
}

export interface RouteContract<
  P extends Shape | undefined,
  Q extends Shape | undefined,
  B extends Shape | undefined,
  R extends ZodType,
> {
  readonly id: `${Service}.${string}.${string}`;
  readonly service: Service;
  readonly method: HttpMethod;
  readonly path: `/api/v1/${Service}/${string}`;
  readonly summary: string;
  readonly apps: readonly [App, ...App[]];
  readonly permission: PermissionDefinition | 'public';
  /** A fresh authenticator code is asked first: it is the permission's, and a public route has none. */
  readonly stepUp: boolean;
  readonly rateLimit: RateLimitClass;
  readonly idempotency: 'required' | 'none';
  readonly cache: { readonly maxAgeSeconds: number } | undefined;
  readonly params: SchemaOf<P>;
  readonly query: SchemaOf<Q>;
  readonly body: SchemaOf<B>;
  readonly response: R;
  readonly status: RouteStatus;
  readonly errors: Readonly<Record<string, ErrorStatus>>;
}

/** What a route is, without its schemas' exact types: for a list of routes. */
export interface AnyRoute {
  readonly id: string;
  readonly service: Service;
  readonly method: HttpMethod;
  readonly path: string;
  readonly summary: string;
  readonly apps: readonly App[];
  readonly permission: PermissionDefinition | 'public';
  readonly stepUp: boolean;
  readonly rateLimit: RateLimitClass;
  readonly idempotency: 'required' | 'none';
  readonly cache: { readonly maxAgeSeconds: number } | undefined;
  readonly params: ZodType | undefined;
  readonly query: ZodType | undefined;
  readonly body: ZodType | undefined;
  readonly response: ZodType;
  readonly status: RouteStatus;
  readonly errors: Readonly<Record<string, ErrorStatus>>;
}

const SERVICE_PATTERN = SERVICES.join('|');
const ID_FORMAT = new RegExp(`^(${SERVICE_PATTERN})\\.[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$`);
const PATH_FORMAT = new RegExp(
  `^/api/v1/(${SERVICE_PATTERN})(/(:[A-Za-z][A-Za-z0-9]*|[a-z0-9]+(-[a-z0-9]+)*))+$`,
);
const PATH_PARAM = /:([A-Za-z][A-Za-z0-9]*)/g;

/** The names of the `:name` parts of a path, in order. */
export function pathParamNames(path: string): string[] {
  return [...path.matchAll(PATH_PARAM)].map((match) => match[1] as string);
}

function fail(id: string, reason: string): never {
  throw new RangeError(`The route ${id} ${reason}.`);
}

// A part of a request as a strict object: a field that is not named is refused (SR-036), and the
// message says which route and what the part takes, like "The body of commerce.order.place takes
// only addressId, items."
function strictPart(id: string, part: 'path' | 'query' | 'body', shape: Shape | undefined) {
  if (shape === undefined) return undefined;
  const names = Object.keys(shape);
  const takes = names.length === 0 ? 'nothing' : `only ${names.join(', ')}`;
  return strictObject(shape, `The ${part} of ${id} takes ${takes}.`);
}

/**
 * The one place a route is told (docs/ARCHITECTURE.md §5 rule 1): its method and path, what it takes
 * and gives, the apps, the permission, the rate limit class, the idempotency and the cache. The
 * route manifest, the typed client and the OpenAPI document are all made from it. It is refused if
 * it contradicts itself: a path that is not of its service, a `:name` without a `params` field (or
 * the other way), a GET with a body or an idempotency key, a cache on a route that is not a public
 * GET, a 204 that has a body.
 */
export function defineRoute<
  P extends Shape | undefined = undefined,
  Q extends Shape | undefined = undefined,
  B extends Shape | undefined = undefined,
  R extends ZodType = ZodType,
>(route: RouteDefinition<P, Q, B, R>): RouteContract<P, Q, B, R> {
  const { id, method, path, permission } = route;
  if (!ID_FORMAT.test(id))
    fail(id, 'is not <service>.<resource>.<action>, with a service of the list');
  const service = id.slice(0, id.indexOf('.')) as Service;
  if (!PATH_FORMAT.test(path) || !path.startsWith(`/api/v1/${service}/`)) {
    fail(
      id,
      `has the path ${path}, which is not /api/v1/${service}/... in lowercase, with :name for a changing part`,
    );
  }
  if (new Set(route.apps).size !== route.apps.length) fail(id, 'names an app twice');

  const named = pathParamNames(path).sort();
  const declared = Object.keys(route.params ?? {}).sort();
  if (named.join() !== declared.join()) {
    fail(
      id,
      `has the path parts (${named.join(', ')}) and the params (${declared.join(', ')}), which are not the same`,
    );
  }

  const idempotency = route.idempotency ?? 'none';
  if (method === 'GET' && route.body !== undefined) fail(id, 'is a GET with a body');
  if (method === 'GET' && idempotency === 'required') fail(id, 'is a GET with an idempotency key');
  if (route.cache !== undefined) {
    if (method !== 'GET' || permission !== 'public')
      fail(id, 'has a cache, which only a public GET can have');
    if (!Number.isInteger(route.cache.maxAgeSeconds) || route.cache.maxAgeSeconds < 1) {
      fail(id, 'has a cache time that is not a whole number of seconds from 1');
    }
  }
  const status = route.status ?? 200;
  if (status === 204 && !route.response.safeParse(undefined).success) {
    fail(id, 'answers 204, which has no body, but its response needs one');
  }

  return Object.freeze({
    id,
    service,
    method,
    path,
    summary: route.summary,
    apps: route.apps,
    permission,
    stepUp: permission !== 'public' && permission.stepUp,
    rateLimit: route.rateLimit,
    idempotency,
    cache: route.cache,
    params: strictPart(id, 'path', route.params) as SchemaOf<P>,
    query: strictPart(id, 'query', route.query) as SchemaOf<Q>,
    body: strictPart(id, 'body', route.body) as SchemaOf<B>,
    response: route.response,
    status,
    errors: route.errors ?? {},
  });
}
