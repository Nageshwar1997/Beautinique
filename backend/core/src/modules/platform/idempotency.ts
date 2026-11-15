import { createHash } from 'node:crypto';

import {
  AppError,
  type Logger,
  mountRoute,
  type MountRouteOptions,
  type Passport,
  type RouteHandler,
} from '@beautinique/backend-server-kit';
import { type IndexSpec, type Mongo, ObjectId } from '@beautinique/backend-server-mongo';
import { HEADERS, type RouteDefinition } from '@beautinique/shared-contracts';
import type { Request, RequestHandler, Router } from 'express';

/**
 * Idempotency keys (ARCHITECTURE §5.3, TASKS T4.1): a request sent again with the same
 * Idempotency-Key gets the first answer back and does nothing twice (a double tap, a retry after
 * a lost reply). The key counts per route and caller: the signed-in user, or the client's IP on a
 * public route (owner, 2026-11-14), stored only as a hash. 2xx and 4xx answers are kept 48 hours;
 * a 5xx is not, so a retry really runs again.
 */
export const IDEMPOTENCY = 'platform_idempotency';
export const IDEMPOTENCY_SECONDS = 48 * 60 * 60;
/**
 * A request still marked running after this long is taken over by the next try: the process that
 * ran it died on the way (a deploy, a crash), and the client may retry.
 */
export const RUNNING_LEASE_MS = 60_000;
/** The header on an answer given again from the store. */
export const REPLAYED_HEADER = 'Idempotent-Replayed';

interface IdempotencyRecord {
  _id: ObjectId;
  /** sha256 of route, caller and Idempotency-Key: no IP or key in the clear */
  key: string;
  /** sha256 of the request (params, query, body): the same key for another request is refused */
  request: string;
  state: 'running' | 'done';
  /** Until when a running request is its own; after that, the next try may take it over */
  lockedUntil: Date | null;
  /**
   * The answer as it went out: its status and its JSON text, kept as text since it is a copy of a
   * message (its ids are text on the wire), not data of core's (RULES §4.17)
   */
  response: { status: number; json: string } | null;
  createdAt: Date;
}

export const idempotencyIndexes: readonly IndexSpec[] = [
  { collection: IDEMPOTENCY, name: 'key_unique', key: { key: 1 }, unique: true },
  {
    collection: IDEMPOTENCY,
    name: 'createdAt_ttl',
    key: { createdAt: 1 },
    expireAfterSeconds: IDEMPOTENCY_SECONDS,
  },
];

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

/** JSON with every object's keys sorted, so the same request always hashes the same. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, inner]) => inner !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([key, inner]) => `${JSON.stringify(key)}:${stable(inner)}`).join(',')}}`;
  }
  // JSON has no undefined (an array keeps its place as null)
  return value === undefined ? 'null' : JSON.stringify(value);
}

/** Whose key it is: the signed-in user, or on a public route the client's IP (from the gateway). */
async function callerOf(
  route: RouteDefinition,
  req: Request,
  passport: (req: Request) => Promise<Passport>,
): Promise<string> {
  if (route.access.type === 'public') return `ip:${req.get(HEADERS.clientIp) ?? ''}`;
  return `user:${(await passport(req)).userId}`;
}

export interface IdempotencyDeps {
  mongo: Mongo;
  passport: (req: Request) => Promise<Passport>;
  /** An answer that could not be kept is an error in the logs (Sentry): a retry may run again */
  logger: Logger;
}

/**
 * The idempotency step of an idempotent route, before its handler: a new key claims the request
 * (running), and its answer is kept when the handler sends it; the same key again gets the kept
 * answer (header Idempotent-Replayed), 409 while the first still runs, 422 for another request.
 * A replay gives back the first answer's status and body (its requestId too) with the headers every
 * answer gets; a route whose answer sets a header of its own (a Location) keeps it in the record
 * before it is made idempotent.
 */
export function idempotency(route: RouteDefinition, deps: IdempotencyDeps): RequestHandler {
  const records = deps.mongo.db.collection<IdempotencyRecord>(IDEMPOTENCY);
  return (req, res, next) => {
    void (async () => {
      const given = req.get(HEADERS.idempotencyKey);
      if (given === undefined || given === '') {
        throw new AppError(
          'IDEMPOTENCY_KEY_REQUIRED',
          'This request needs an Idempotency-Key header.',
        );
      }
      const key = sha256(`${route.id}\n${await callerOf(route, req, deps.passport)}\n${given}`);
      const request = sha256(
        stable({ params: req.params, query: req.query, body: req.body as unknown }),
      );
      const now = new Date();
      const lockedUntil = new Date(now.getTime() + RUNNING_LEASE_MS);
      // the first try claims the key; a second try at once finds it (a unique key, no race)
      const claimed = await records.updateOne(
        { key },
        {
          $setOnInsert: {
            _id: new ObjectId(),
            key,
            request,
            state: 'running',
            lockedUntil,
            response: null,
            createdAt: now,
          },
        },
        { upsert: true },
      );
      if (claimed.upsertedCount !== 1) {
        const found = await records.findOne({ key });
        if (found && found.request !== request) {
          throw new AppError(
            'IDEMPOTENCY_KEY_REUSED',
            'This Idempotency-Key was used for another request. Send a new key.',
          );
        }
        if (found?.state === 'done' && found.response) {
          res.set(REPLAYED_HEADER, 'true');
          res.status(found.response.status).json(JSON.parse(found.response.json) as unknown);
          return;
        }
        // still running: take it over only when its lease ran out (its process died)
        const taken = await records.updateOne(
          { key, state: 'running', lockedUntil: { $lt: now } },
          { $set: { lockedUntil } },
        );
        if (taken.modifiedCount !== 1) {
          throw new AppError(
            'IDEMPOTENCY_KEY_IN_USE',
            'A request with this Idempotency-Key is still running. Try again in a moment.',
          );
        }
      }
      // keep the answer before it goes out, so a retry right after finds it
      const send = res.json.bind(res);
      res.json = (body: unknown) => {
        const status = res.statusCode;
        const kept =
          status >= 500
            ? records.deleteOne({ key })
            : records.updateOne(
                { key },
                {
                  $set: {
                    state: 'done',
                    lockedUntil: null,
                    response: { status, json: JSON.stringify(body) },
                  },
                },
              );
        kept.then(
          () => send(body),
          (error: unknown) => {
            deps.logger.error({ err: error, route: route.id }, 'idempotency answer not kept');
            send(body);
          },
        );
        return res;
      };
      next();
    })().catch(next);
  };
}

/**
 * Mounts a core route: its idempotency step first when the contract asks for one, then the
 * handler (server-kit mountRoute). Core's modules mount every route with this, never mountRoute
 * itself, so an idempotent route can never go without it (test/kernel.test.ts).
 */
export function mountCoreRoute<const Route extends RouteDefinition>(
  router: Router,
  route: Route,
  handler: RouteHandler<Route>,
  deps: IdempotencyDeps,
  options?: MountRouteOptions,
): void {
  if (route.download) throw new Error(`${route.id} is a download: mount it with mountCoreDownload`);
  if (route.idempotency) {
    router[route.method.toLowerCase() as Lowercase<Route['method']>](
      route.path,
      idempotency(route, deps),
    );
  }
  mountRoute(router, route, handler, options);
}
