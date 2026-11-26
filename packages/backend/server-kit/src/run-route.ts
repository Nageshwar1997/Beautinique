import type { Clock } from '@beautinique/shared-clock';
import { COMMON_ERRORS, type AnyRoute } from '@beautinique/shared-contracts';
import type { input, output, ZodType } from 'zod';

import type { Actor, Resource, Scope } from './actor.ts';
import { authorize, type Decision } from './authorize.ts';
import { decodeJson, decodeText, MAX_ISSUES, type Decoded } from './decode.ts';
import {
  AppError,
  errorBody,
  forbidden,
  idempotencyInProgress,
  idempotencyKeyReused,
  internalError,
  notFound,
  serviceUnavailable,
  stepUpRequired,
  toAppError,
  unauthenticated,
  validationFailed,
  type FieldIssue,
} from './errors.ts';
import {
  fingerprintOf,
  IDEMPOTENCY_LEASE_MS,
  IDEMPOTENCY_TTL_MS,
  type IdempotencyId,
  type IdempotencyStore,
} from './idempotency.ts';

/** What the kit logs to: `pino`, and the logger of `backend-logger`, are this. */
export interface Logger {
  error(fields: Readonly<Record<string, unknown>>, message: string): void;
}

type Parsed<S> = S extends ZodType ? output<S> : undefined;

/** What a handler is given: the parts of the request, already checked with the schemas of the contract. */
export interface HandlerContext<C extends AnyRoute> {
  readonly params: Parsed<C['params']>;
  readonly query: Parsed<C['query']>;
  readonly body: Parsed<C['body']>;
  /** Who asks. A route that is not public always has one. */
  readonly actor: Actor | undefined;
  readonly requestId: string;
  /**
   * Where the actor holds the permission of the route: a handler that lists or creates filters by
   * these (SR-033, SR-034). Empty on a public route.
   */
  readonly scopes: readonly Scope[];
  /**
   * `authorize(actor, permission, resource)` of the route, for a resource that the handler has
   * read (docs/ARCHITECTURE.md §11 rule 7). Throws the answer when it is not allowed: 404 for a
   * resource outside the scopes of the actor, the same as one that is not there (SR-033).
   */
  authorize(resource: Resource): void;
}

// A route that answers nothing (a 204) may return nothing: `void` is how a function says that.
type Answer<C extends AnyRoute> =
  undefined extends input<C['response']>
    ? // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      input<C['response']> | void
    : input<C['response']>;

/** The code of a route: what it answers with, or throws an `AppError`. */
export type RouteHandler<C extends AnyRoute> = (ctx: HandlerContext<C>) => Promise<Answer<C>>;

/** A request, as the kit takes it: the parts as they came (the schemas of the contract check them), the headers and who asks. */
export interface RouteRequest {
  params: unknown;
  query: unknown;
  body: unknown;
  /** Names in lowercase. */
  headers: Readonly<Record<string, string | undefined>>;
  requestId: string;
  actor: Actor | undefined;
}

/** What goes back: the status, the headers and the JSON body (none for a 204). */
export interface RouteResponse {
  status: number;
  headers: Readonly<Record<string, string>>;
  body: unknown;
}

export interface RouteDeps {
  clock: Clock;
  logger: Logger;
  /** Needed by a route that asks for an idempotency key. */
  idempotency?: IdempotencyStore;
}

export type RouteRunner = (request: RouteRequest) => Promise<RouteResponse>;

// 8 to 128 characters that are safe in a key of a database and in a log (a UUID is one).
const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{8,128}$/;

function decide(decision: Decision): readonly Scope[] {
  if (decision.allowed) return decision.scopes;
  switch (decision.reason) {
    case 'unauthenticated':
      throw unauthenticated();
    case 'forbidden':
      throw forbidden();
    case 'not-found':
      throw notFound();
    case 'step-up-required':
      throw stepUpRequired();
  }
}

/**
 * The runner of one route, made once when the service boots from the contract and the handler
 * (CR-40: nothing of the contract is looked at again on a request). What it does with a request,
 * in this order, and stops at the first that says no:
 *
 * 1. a route that is not public: an actor (401), of an app that the route allows (403, SR-035),
 *    who holds the permission (403) and, if it asks, has a fresh step-up (403 `STEP_UP_REQUIRED`);
 * 2. the path, the query and the body with the strict schemas of the contract (400, SR-036), and
 *    the `Idempotency-Key` header of a route that asks for one;
 * 3. a route with an idempotency key: the same key and request answers what it answered, another
 *    request with the key is 422, one that is still running is 409 (SR-045);
 * 4. the handler; and what it gives is checked with the response schema of the contract, so a field
 *    that the contract does not name never leaves (SR-036). An error that the route does not list
 *    is a 500: a service answers only with the codes of its contract.
 *
 * It does not throw: every error becomes an answer in the one shape, with the request id.
 */
export function createRouteRunner<C extends AnyRoute>(
  route: C,
  handler: RouteHandler<C>,
  deps: RouteDeps,
): RouteRunner {
  const { permission } = route;
  const store = deps.idempotency;
  if (route.idempotency === 'required') {
    if (store === undefined) {
      throw new RangeError(
        `The route ${route.id} asks for an idempotency key, so the kit needs an idempotency store.`,
      );
    }
    if (permission === 'public') {
      throw new RangeError(
        `The route ${route.id} is public and asks for an idempotency key, which needs a caller.`,
      );
    }
  }

  const apps = new Set<string>(route.apps);
  // The status of every code that the route may answer with: the common ones and its own.
  const statusOf = new Map<string, number>([
    ...Object.entries(COMMON_ERRORS),
    ...Object.entries(route.errors),
  ]);
  const cacheControl =
    route.cache === undefined
      ? 'private, no-store'
      : `public, max-age=${String(route.cache.maxAgeSeconds)}`;

  const headersOf = (status: number, requestId: string, retryAfter?: number) => ({
    'x-request-id': requestId,
    'cache-control': status < 400 ? cacheControl : 'private, no-store',
    ...(retryAfter === undefined ? {} : { 'retry-after': String(retryAfter) }),
  });

  function failure(thrown: unknown, requestId: string): RouteResponse {
    let error = toAppError(thrown);
    if (!(thrown instanceof AppError)) {
      deps.logger.error({ err: thrown, routeId: route.id, requestId }, 'A route failed.');
    } else if (statusOf.get(error.code) !== error.status) {
      deps.logger.error(
        { routeId: route.id, requestId, code: error.code, status: error.status },
        'A route answered with an error that its contract does not list.',
      );
      error = internalError();
    }
    return {
      status: error.status,
      headers: headersOf(error.status, requestId, error.retryAfterSeconds),
      body: errorBody(error, requestId),
    };
  }

  async function handle(request: RouteRequest, context: Parts, scopes: readonly Scope[]) {
    const { actor, requestId } = request;
    try {
      const raw = await handler({
        ...context,
        actor,
        requestId,
        scopes,
        authorize(resource) {
          if (permission === 'public') {
            throw new TypeError(`The route ${route.id} is public, so it has nothing to authorize.`);
          }
          decide(authorize(actor, permission, resource, deps.clock.now()));
        },
      } as HandlerContext<C>);
      const checked = route.response.safeParse(raw);
      if (!checked.success) {
        deps.logger.error(
          {
            routeId: route.id,
            requestId,
            issues: checked.error.issues.slice(0, MAX_ISSUES).map((issue) => issue.path.join('.')),
          },
          'A route answered with something that its contract does not allow.',
        );
        throw internalError();
      }
      return {
        status: route.status,
        headers: headersOf(route.status, requestId),
        body: route.status === 204 ? undefined : checked.data,
      } satisfies RouteResponse;
    } catch (thrown) {
      return failure(thrown, requestId);
    }
  }

  async function attempt(request: RouteRequest): Promise<RouteResponse> {
    const { actor } = request;
    let scopes: readonly Scope[] = [];
    if (permission !== 'public') {
      if (actor === undefined) throw unauthenticated();
      if (!apps.has(actor.app)) throw forbidden();
      scopes = decide(authorize(actor, permission, undefined, deps.clock.now()));
    }

    const issues: FieldIssue[] = [];
    const read = (decoded: Decoded): unknown => {
      if (decoded.ok) return decoded.value;
      issues.push(...decoded.issues);
      return undefined;
    };
    const context: Parts = {
      params:
        route.params === undefined
          ? undefined
          : read(decodeText(route.params, 'path', request.params)),
      query:
        route.query === undefined
          ? undefined
          : read(decodeText(route.query, 'query', request.query)),
      body: route.body === undefined ? undefined : read(decodeJson(route.body, request.body)),
    };
    const key = request.headers['idempotency-key'];
    if (route.idempotency === 'required' && (key === undefined || !IDEMPOTENCY_KEY.test(key))) {
      issues.push({
        path: 'headers.Idempotency-Key',
        message: 'The Idempotency-Key header is required: 8 to 128 letters, digits, - or _.',
      });
    }
    if (issues.length > 0) throw validationFailed(issues.slice(0, MAX_ISSUES));

    if (
      route.idempotency !== 'required' ||
      store === undefined ||
      actor === undefined ||
      key === undefined
    ) {
      return handle(request, context, scopes);
    }
    return idempotent(request, context, scopes, store, {
      caller: actor.accountId,
      routeId: route.id,
      key,
    });
  }

  async function idempotent(
    request: RouteRequest,
    context: Parts,
    scopes: readonly Scope[],
    store: IdempotencyStore,
    id: IdempotencyId,
  ): Promise<RouteResponse> {
    const { requestId } = request;
    const now = deps.clock.now();
    let begun;
    try {
      begun = await store.begin(
        id,
        fingerprintOf(context),
        now,
        new Date(now.getTime() + IDEMPOTENCY_LEASE_MS),
      );
    } catch (thrown) {
      // Without the store there is no telling whether this request has run, so it does not run.
      deps.logger.error(
        { err: thrown, routeId: route.id, requestId },
        'The idempotency store failed.',
      );
      throw serviceUnavailable(5);
    }
    if (begun.kind === 'in-progress') throw idempotencyInProgress();
    if (begun.kind === 'key-reused') throw idempotencyKeyReused();
    if (begun.kind === 'replay') {
      const { status, body } = begun.response;
      return { status, headers: headersOf(status, requestId), body };
    }

    const response = await handle(request, context, scopes);
    try {
      if (response.status >= 500) await store.release(id);
      else {
        await store.complete(
          id,
          { status: response.status, body: response.body },
          new Date(now.getTime() + IDEMPOTENCY_TTL_MS),
        );
      }
    } catch (thrown) {
      // The answer is sent; the record frees itself when its lease ends.
      deps.logger.error(
        { err: thrown, routeId: route.id, requestId },
        'The idempotency store failed.',
      );
    }
    return response;
  }

  return async (request) => {
    try {
      return await attempt(request);
    } catch (thrown) {
      return failure(thrown, request.requestId);
    }
  };
}

// The parts after the checks.
interface Parts {
  params: unknown;
  query: unknown;
  body: unknown;
}
