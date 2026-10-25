import type { RouteDefinition, RouteInput, RouteOutput } from '@beautinique/shared-contracts';
import type { Request, Response, Router } from 'express';

import { requestIdOf } from './request';

/** What a route handler gets besides its checked input. */
export interface RouteContext {
  req: Request;
  res: Response;
  /** The id in the `X-Request-Id` header and in every log line of this request. */
  requestId: string;
}

export type RouteHandler<Route extends RouteDefinition> = (
  input: RouteInput<Route>,
  context: RouteContext,
) => Promise<RouteOutput<Route>> | RouteOutput<Route>;

export interface MountRouteOptions {
  /** The success status (default 200; a route that creates something answers 201). */
  status?: number;
}

/**
 * Mounts a handler on a contract route (RULES §4.1: contract first). The path and method come from
 * the route; `params`, `query` and `body` are checked with the route's schemas before the handler
 * runs (a wrong request is `VALIDATION_FAILED` with the field list); the handler's result is
 * checked against the route's output schema, which also drops fields the contract does not name,
 * and goes out as `{ data }`. A result that breaks the contract is a server bug: `INTERNAL`, logged,
 * and nothing of it reaches the client. Whatever the handler throws goes to the error handler.
 *
 * Who may call the route (`access`, `apps`, `stepUp`, `rateLimit`) is the gateway's job, and
 * idempotency keys are the platform kernel's (ARCHITECTURE §7, T4.1): this only does the HTTP part.
 */
export function mountRoute<const Route extends RouteDefinition>(
  router: Router,
  route: Route,
  handler: RouteHandler<Route>,
  options: MountRouteOptions = {},
): void {
  const { params, query, body } = route.input;
  router[route.method.toLowerCase() as Lowercase<Route['method']>](
    route.path,
    async (req: Request, res: Response) => {
      const input = {
        params: params?.parse(req.params),
        query: query?.parse(req.query),
        body: body?.parse(req.body),
      } as RouteInput<Route>;
      const result = await handler(input, { req, res, requestId: requestIdOf(res) });
      const checked = route.output.safeParse(result);
      if (!checked.success) {
        throw new Error(`Route ${route.id} returned data that breaks its contract`, {
          cause: checked.error,
        });
      }
      res.status(options.status ?? 200).json({ data: checked.data });
    },
  );
}
