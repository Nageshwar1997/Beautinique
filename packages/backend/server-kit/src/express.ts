import type { Clock } from '@beautinique/shared-clock';
import type { AnyRoute, Service } from '@beautinique/shared-contracts';
import express, { type NextFunction, type Request, type Response, type Router } from 'express';

import type { Actor } from './actor.ts';
import {
  errorBody,
  internalError,
  notFound,
  payloadTooLarge,
  serviceUnavailable,
  validationFailed,
  type AppError,
} from './errors.ts';
import {
  createFacadeEndpoint,
  facadePath,
  type Facade,
  type FacadeEndpointOptions,
  type FacadeImplementation,
  type FacadeMethods,
} from './facade.ts';
import type { IdempotencyStore } from './idempotency.ts';
import { requestIdOf } from './request-id.ts';
import {
  createRouteRunner,
  type Logger,
  type RouteHandler,
  type RouteResponse,
  type RouteRunner,
} from './run-route.ts';

/** A JSON body is at most 100 KB (SR-007): files go straight to storage, not through the backend. */
export const JSON_BODY_LIMIT_BYTES = 100 * 1024;

/** A call between services carries an actor and an input: a little more room than a request from an app. */
export const INTERNAL_BODY_LIMIT_BYTES = 256 * 1024;

export interface ServerKitOptions {
  clock: Clock;
  logger: Logger;
  /** Needed by a route that asks for an idempotency key. */
  idempotency?: IdempotencyStore;
  /**
   * Who asks. The gateway has already checked the session (SR-029, SR-031); in a bundle its
   * middleware leaves the actor on the request, and this reads it. It throws when the session
   * cannot be checked, and then the answer is 503 and not 401.
   */
  actorOf(request: Request): Actor | undefined | Promise<Actor | undefined>;
}

/** A route with its code, ready to be put in a router. Only a route with a contract can be one. */
export interface Registration {
  readonly route: AnyRoute;
  readonly run: RouteRunner;
}

function requestIdFrom(request: Request): string {
  return requestIdOf(request.get('x-request-id'));
}

function headersOf(request: Request): Record<string, string | undefined> {
  const headers: Record<string, string | undefined> = {};
  for (const [name, value] of Object.entries(request.headers)) {
    headers[name] = Array.isArray(value) ? value.join(', ') : value;
  }
  return headers;
}

function send(response: Response, answer: RouteResponse): void {
  response.status(answer.status).set(answer.headers);
  if (answer.body === undefined) response.end();
  else response.json(answer.body);
}

function sendError(response: Response, error: AppError, requestId: string): void {
  send(response, {
    status: error.status,
    headers: {
      'x-request-id': requestId,
      'cache-control': 'private, no-store',
      ...(error.retryAfterSeconds === undefined
        ? {}
        : { 'retry-after': String(error.retryAfterSeconds) }),
    },
    body: errorBody(error, requestId),
  });
}

// What the JSON parser of Express says is wrong with a body, as an answer in the one shape.
function bodyProblem(error: unknown): AppError | undefined {
  const type = (error as { type?: unknown } | null)?.type;
  if (type === 'entity.too.large') return payloadTooLarge();
  if (typeof type === 'string' && type.startsWith('entity.')) {
    return validationFailed([{ path: 'body', message: 'The body must be JSON.' }]);
  }
  if (type === 'encoding.unsupported' || type === 'charset.unsupported') {
    return validationFailed([{ path: 'body', message: 'The body must be JSON in UTF-8.' }]);
  }
  return undefined;
}

export interface ServerKit {
  /** A route with its code. Nothing can be registered without a contract (CR-12). */
  route<C extends AnyRoute>(route: C, handler: RouteHandler<C>): Registration;
  /**
   * The router of a service: its routes, with the JSON body of a route that has one limited, and every error in the one
   * shape. A route of another service, or two routes with one id or at one place, stop the boot.
   * Paths are exact: `/orders/` is not `/orders`, and `/Orders` is not `/orders`.
   */
  router(service: Service, registrations: readonly Registration[]): Router;
  /** The router of a facade (split mode): a signed `POST /internal/<service>/<call>` for each of its calls. */
  facadeRouter<M extends FacadeMethods>(
    facade: Facade<M>,
    implementation: FacadeImplementation<M>,
    options: FacadeEndpointOptions,
  ): Router;
  /** The last middleware of an app: what no route took is a 404 in the one shape. */
  notFound(request: Request, response: Response): void;
}

export function createServerKit(options: ServerKitOptions): ServerKit {
  const deps = {
    clock: options.clock,
    logger: options.logger,
    ...(options.idempotency === undefined ? {} : { idempotency: options.idempotency }),
  };

  return {
    route: (route, handler) => ({ route, run: createRouteRunner(route, handler, deps) }),

    router(service, registrations) {
      const ids = new Set<string>();
      const places = new Set<string>();
      for (const { route } of registrations) {
        const place = `${route.method} ${route.path.replaceAll(/:[A-Za-z][A-Za-z0-9]*/g, ':')}`;
        if (route.service !== service) {
          throw new RangeError(`The route ${route.id} is of ${route.service}, not of ${service}.`);
        }
        if (ids.has(route.id)) throw new RangeError(`Two routes have the id ${route.id}.`);
        if (places.has(place)) throw new RangeError(`Two routes are at ${place}.`);
        ids.add(route.id);
        places.add(place);
      }

      const router = express.Router({ caseSensitive: true, strict: true });
      // Only a route that has a body reads one (not the router: it would read the body of every
      // request that passes it, including the signed calls, whose bytes are needed as they came).
      const jsonBody = express.json({ limit: JSON_BODY_LIMIT_BYTES });
      for (const { route, run } of registrations) {
        const method = route.method.toLowerCase() as Lowercase<typeof route.method>;
        const parse = route.body === undefined ? [] : [jsonBody];
        router[method](route.path, ...parse, async (request: Request, response: Response) => {
          const requestId = requestIdFrom(request);
          let actor: Actor | undefined;
          try {
            actor = await options.actorOf(request);
          } catch (thrown) {
            options.logger.error({ err: thrown, requestId }, 'The session could not be checked.');
            sendError(response, serviceUnavailable(5), requestId);
            return;
          }
          send(
            response,
            await run({
              params: request.params,
              query: request.query,
              body: request.body as unknown,
              headers: headersOf(request),
              requestId,
              actor,
            }),
          );
        });
      }
      // Express tells an error handler by its four parameters, so `_next` has to be there.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      router.use((error: unknown, request: Request, response: Response, _next: NextFunction) => {
        const requestId = requestIdFrom(request);
        const problem = bodyProblem(error);
        if (problem === undefined) {
          options.logger.error({ err: error, requestId }, 'A request failed before its route.');
          sendError(response, internalError(), requestId);
          return;
        }
        sendError(response, problem, requestId);
      });
      return router;
    },

    facadeRouter(facade, implementation, endpointOptions) {
      const answer = createFacadeEndpoint(facade, implementation, endpointOptions);
      const router = express.Router({ caseSensitive: true, strict: true });
      router.post(
        facadePath(facade.service, ':method'),
        // The signature is over the exact bytes, so the body is kept as it came.
        express.raw({ type: 'application/json', limit: INTERNAL_BODY_LIMIT_BYTES }),
        async (request, response) => {
          const body = Buffer.isBuffer(request.body) ? request.body.toString('utf8') : '';
          const named = request.params['method'];
          const { status, body: result } = await answer(typeof named === 'string' ? named : '', {
            headers: headersOf(request),
            body,
          });
          response.status(status).json(result);
        },
      );
      // Express tells an error handler by its four parameters, so `_next` has to be there.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      router.use((error: unknown, request: Request, response: Response, _next: NextFunction) => {
        const requestId = requestIdFrom(request);
        const problem = bodyProblem(error);
        if (problem === undefined)
          options.logger.error({ err: error, requestId }, 'A call failed before its route.');
        sendError(response, problem ?? internalError(), requestId);
      });
      return router;
    },

    notFound(request, response) {
      sendError(response, notFound(), requestIdFrom(request));
    },
  };
}
