import type { ManifestEntry } from './manifest.ts';

/** The entry of a request (its method and its real path), or `undefined` when no contract fits. */
export type RouteMatcher = (method: string, pathname: string) => ManifestEntry | undefined;

// One step of a path in the trie: the parts that are written (`orders`), and at most one `:name`
// part (every `:name` is the same place, whatever its name). A `Map`, so a part like `__proto__`
// is just a part.
interface Place {
  written: Map<string, Place>;
  named: Place | undefined;
  entry: ManifestEntry | undefined;
}

function newPlace(): Place {
  return { written: new Map(), named: undefined, entry: undefined };
}

// The way to the entry of a path, from `start`, the first character of the part that is next. The
// part is looked at in place (`indexOf` and `slice`), so a long path is never split into a list. A
// written part is tried first, so it wins over a `:name` part at the first place where they differ
// (`/orders/mine` over `/orders/:orderId`); if its way ends without a route, the `:name` part is
// tried (`/orders/mine/lines` is the `/orders/:orderId/lines` route when `mine` has no `lines`). A
// `:name` is never an empty part. The depth of the recursion is the depth of the trie (the longest
// path in the manifest), whatever the request is, and a place is visited at most once.
function find(place: Place, pathname: string, start: number): ManifestEntry | undefined {
  const end = pathname.indexOf('/', start);
  const last = end === -1;
  const part = last ? pathname.slice(start) : pathname.slice(start, end);

  const written = place.written.get(part);
  if (written !== undefined) {
    const found = last ? written.entry : find(written, pathname, end + 1);
    if (found !== undefined) return found;
  }
  if (place.named === undefined || part === '') return undefined;
  return last ? place.named.entry : find(place.named, pathname, end + 1);
}

/**
 * The lookup of a request's route in the manifest (SR-032), made once, when the service boots. A
 * trie of the path parts, one for each method: it costs O(the parts of the path), and does not grow
 * with the number of routes (docs/RULES.md CR-40), where a scan of the whole manifest costs O(the
 * routes) on every request. A part that is written (`/orders/mine`) wins over a `:name` part
 * (`/orders/:orderId`).
 *
 * Two routes of one method at one place (`/orders/:orderId` and `/orders/:id`) are refused, the
 * same as `buildRouteManifest` does.
 */
export function createRouteMatcher(manifest: readonly ManifestEntry[]): RouteMatcher {
  const roots = new Map<string, Place>();
  for (const entry of manifest) {
    let root = roots.get(entry.method);
    if (root === undefined) {
      root = newPlace();
      roots.set(entry.method, root);
    }
    let place = root;
    const parts = entry.path.split('/');
    for (const part of parts) {
      if (part.startsWith(':')) {
        place.named ??= newPlace();
        place = place.named;
      } else {
        let next = place.written.get(part);
        if (next === undefined) {
          next = newPlace();
          place.written.set(part, next);
        }
        place = next;
      }
    }
    if (place.entry !== undefined) {
      const shape = parts.map((part) => (part.startsWith(':') ? ':' : part)).join('/');
      throw new RangeError(`Two routes are at ${entry.method} ${shape}.`);
    }
    place.entry = entry;
  }

  return (method, pathname) => {
    const root = roots.get(method);
    return root === undefined ? undefined : find(root, pathname, 0);
  };
}
