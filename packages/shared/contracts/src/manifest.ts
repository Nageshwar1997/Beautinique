import type { App } from './constants/apps.ts';
import type { HttpMethod } from './constants/http-methods.ts';
import { RATE_LIMIT_CLASSES, type RateLimitClass } from './constants/rate-limit-classes.ts';
import type { Service } from './constants/services.ts';
import type { AnyRoute } from './route.ts';

/** What the gateway needs of a route (SR-032, SR-035): who may call it, with what, and how often. */
export interface ManifestEntry {
  id: string;
  service: Service;
  method: HttpMethod;
  path: string;
  apps: readonly App[];
  /** The permission it asks for, or `null` for a public route. */
  permission: string | null;
  stepUp: boolean;
  rateLimit: RateLimitClass;
  /** The counter is out of reach: 503 (`true`) or the process's own small limit (`false`). */
  failClosed: boolean;
  idempotency: 'required' | 'none';
  cacheMaxAgeSeconds: number | null;
}

// The order of the manifest and of the OpenAPI paths: by path, then by method, so it is the same
// whatever the order the routes were given in.
export function compareRoutes(
  a: { path: string; method: string },
  b: { path: string; method: string },
): number {
  return a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path);
}

// The shape of a path, with every `:name` as `:`: `/orders/:orderId` and `/orders/:id` are one place.
function shapeOf(path: string): string {
  return path.replaceAll(/:[A-Za-z][A-Za-z0-9]*/g, ':');
}

/**
 * The manifest of the routes (docs/ARCHITECTURE.md §5 rule 1), sorted by path and method. The
 * gateway lets through only what is in it: a route that is not in the contracts cannot be reached
 * (SR-032). Two routes with one id, or one method and one place in the path, are refused.
 */
export function buildRouteManifest(routes: readonly AnyRoute[]): ManifestEntry[] {
  const ids = new Set<string>();
  const places = new Set<string>();
  for (const route of routes) {
    const place = `${route.method} ${shapeOf(route.path)}`;
    if (ids.has(route.id)) throw new RangeError(`Two routes have the id ${route.id}.`);
    if (places.has(place)) throw new RangeError(`Two routes are at ${place}.`);
    ids.add(route.id);
    places.add(place);
  }
  return routes
    .map((route): ManifestEntry => ({
      id: route.id,
      service: route.service,
      method: route.method,
      path: route.path,
      apps: route.apps,
      permission: route.permission === 'public' ? null : route.permission.name,
      stepUp: route.stepUp,
      rateLimit: route.rateLimit,
      failClosed: RATE_LIMIT_CLASSES[route.rateLimit].failClosed,
      idempotency: route.idempotency,
      cacheMaxAgeSeconds: route.cache?.maxAgeSeconds ?? null,
    }))
    .sort(compareRoutes);
}

/**
 * The routes that a service has registered (a method and a path) and that are not in the manifest.
 * There should be none: a route without a contract stops the boot, or the CI (CR-12).
 */
export function uncontractedRoutes(
  manifest: readonly ManifestEntry[],
  registered: readonly { method: string; path: string }[],
): { method: string; path: string }[] {
  const known = new Set(manifest.map((entry) => `${entry.method} ${entry.path}`));
  return registered.filter((route) => !known.has(`${route.method} ${route.path}`));
}
