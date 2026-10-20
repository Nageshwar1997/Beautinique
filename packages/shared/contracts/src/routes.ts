import type { input, output, ZodObject, ZodType } from '@beautinique/shared-zod';

import { isPermissionKey } from './permissions';
import { type AppId, APPS, type Deployable, DEPLOYABLES } from './platform';

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

/**
 * Rate-limit classes the gateway knows (budgets live in gateway config). `auth` and `otp` fail closed
 * when Redis is down; the others fail open (ARCHITECTURE §6).
 */
export const RATE_LIMIT_CLASSES = [
  'public',
  'read',
  'write',
  'search',
  'auth',
  'otp',
  'partner-api',
  'webhook',
] as const;
export type RateLimitClass = (typeof RATE_LIMIT_CLASSES)[number];

/** Who may call a route: anyone, any signed-in user of an allowed app, or holders of a permission. */
export type RouteAccess =
  { type: 'public' } | { type: 'signed-in' } | { type: 'permission'; permission: string };

type ObjectSchema = ZodObject;

export interface RouteDefinition {
  /** Unique operation id, `<module>.<resource>.<action>` in camelCase parts, e.g. `catalog.products.list`. */
  id: string;
  method: HttpMethod;
  /** `/catalog/products/:productId`: kebab-case segments and `:camelCase` parameters. */
  path: string;
  summary: string;
  apps: readonly AppId[];
  access: RouteAccess;
  rateLimit: RateLimitClass;
  /** The client must send an Idempotency-Key (never on GET). */
  idempotency: boolean;
  /** Needs a recent MFA step-up (only for permission routes). */
  stepUp: boolean;
  owner: Deployable;
  input: { params?: ObjectSchema; query?: ObjectSchema; body?: ZodType };
  output: ZodType;
}

const ROUTE_ID = /^[a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*){2,}$/;
const SEGMENT = /^(?:[a-z0-9]+(?:-[a-z0-9]+)*|:[a-z][a-zA-Z0-9]*)$/;

/** Parameter names of a path, in order: `/a/:b/c/:d` → `['b', 'd']`. */
export function pathParams(path: string): string[] {
  return path
    .split('/')
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => segment.slice(1));
}

/**
 * Declares an endpoint once (ARCHITECTURE §5.1). The returned object keeps its exact types, so the
 * typed client and handlers infer params, query, body and output from it. Wrong declarations throw.
 */
export function defineRoute<const Route extends RouteDefinition>(route: Route): Route {
  const fail = (problem: string) => {
    throw new Error(`Route "${route.id}": ${problem}`);
  };
  if (!ROUTE_ID.test(route.id)) fail('id must look like <module>.<resource>.<action>');
  if (!HTTP_METHODS.includes(route.method)) fail(`unknown method "${route.method}"`);
  if (
    !route.path.startsWith('/') ||
    !route.path
      .slice(1)
      .split('/')
      .every((s) => SEGMENT.test(s))
  ) {
    fail('path must be /kebab-case segments and :camelCase parameters');
  }
  if (route.summary.trim() === '') fail('needs a summary');
  if (route.apps.length === 0) fail('needs at least one app');
  for (const app of route.apps) {
    if (!(APPS as readonly string[]).includes(app)) fail(`unknown app "${app}"`);
  }
  if (new Set(route.apps).size !== route.apps.length) fail('lists an app twice');
  if (!(DEPLOYABLES as readonly string[]).includes(route.owner))
    fail(`unknown owner "${route.owner}"`);
  if (!(RATE_LIMIT_CLASSES as readonly string[]).includes(route.rateLimit)) {
    fail(`unknown rate-limit class "${route.rateLimit}"`);
  }
  if (route.access.type === 'permission' && !isPermissionKey(route.access.permission)) {
    fail(`"${route.access.permission}" is not a permission key`);
  }
  if (route.stepUp && route.access.type !== 'permission') fail('step-up needs a permission route');
  if (route.idempotency && route.method === 'GET')
    fail('GET routes cannot need an Idempotency-Key');
  if (route.input.body && (route.method === 'GET' || route.method === 'DELETE')) {
    fail(`${route.method} routes cannot have a body`);
  }
  const declared = pathParams(route.path);
  if (new Set(declared).size !== declared.length) fail('path repeats a parameter');
  const schemaKeys = Object.keys(route.input.params?.shape ?? {});
  if (declared.toSorted().join() !== schemaKeys.toSorted().join()) {
    fail(
      `path parameters (${declared.join(', ') || 'none'}) and input.params (${schemaKeys.join(', ') || 'none'}) differ`,
    );
  }
  return Object.freeze(route);
}

/** All routes of the platform. Duplicate ids, or two routes for the same method and path shape, throw. */
export function routeTable<const Routes extends readonly RouteDefinition[]>(
  routes: Routes,
): Routes {
  const ids = new Set<string>();
  const shapes = new Map<string, string>();
  for (const route of routes) {
    if (ids.has(route.id)) throw new Error(`Route id "${route.id}" is declared twice`);
    ids.add(route.id);
    const shape = `${route.method} ${route.path.replace(/:[a-zA-Z0-9]+/g, ':')}`;
    const other = shapes.get(shape);
    if (other)
      throw new Error(
        `Routes "${other}" and "${route.id}" both match ${route.method} ${route.path}`,
      );
    shapes.set(shape, route.id);
  }
  return Object.freeze([...routes]) as unknown as Routes;
}

/** Fills a route path with encoded parameters: `/products/:id` + `{ id: 'a b' }` → `/products/a%20b`. */
export function buildPath(
  path: string,
  params: Readonly<Record<string, string | number>> = {},
): string {
  return path.replace(/:([a-zA-Z0-9]+)/g, (_, name: string) => {
    const value = params[name];
    if (value === undefined || value === '') {
      throw new Error(`Missing path parameter "${name}" for ${path}`);
    }
    return encodeURIComponent(String(value));
  });
}

/** The parameters of `actual` if it matches the route path, else null. */
export function matchPath(path: string, actual: string): Record<string, string> | null {
  const pattern = path.split('/');
  const parts = actual.replace(/\/+$/, '').split('/');
  if (pattern.length !== parts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i += 1) {
    const expected = pattern[i] ?? '';
    const part = parts[i] ?? '';
    if (expected.startsWith(':')) {
      if (part === '') return null;
      try {
        params[expected.slice(1)] = decodeURIComponent(part);
      } catch {
        return null;
      }
    } else if (expected !== part) {
      return null;
    }
  }
  return params;
}

/** What the gateway needs per route (no zod, JSON-safe): app check, auth, rate limit, routing. */
export function gatewayManifest(routes: readonly RouteDefinition[]) {
  return routes.map((route) => ({
    id: route.id,
    method: route.method,
    path: route.path,
    owner: route.owner,
    apps: [...route.apps],
    access: { ...route.access },
    rateLimit: route.rateLimit,
    idempotency: route.idempotency,
    stepUp: route.stepUp,
  }));
}

type InputOf<Schema> = Schema extends ZodType ? input<Schema> : undefined;

/** What the client sends: `{ params, query, body }` with the route's input types. */
export interface RouteRequest<Route extends RouteDefinition> {
  params: Route['input'] extends { params: infer P } ? InputOf<P> : undefined;
  query: Route['input'] extends { query: infer Q } ? InputOf<Q> : undefined;
  body: Route['input'] extends { body: infer B } ? InputOf<B> : undefined;
}

/** What the handler receives after validation (zod output types). */
export interface RouteInput<Route extends RouteDefinition> {
  params: Route['input'] extends { params: infer P extends ZodType } ? output<P> : undefined;
  query: Route['input'] extends { query: infer Q extends ZodType } ? output<Q> : undefined;
  body: Route['input'] extends { body: infer B extends ZodType } ? output<B> : undefined;
}

/** The `data` of the route's success response. */
export type RouteOutput<Route extends RouteDefinition> = output<Route['output']>;
