import { HEADERS } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import type { RequestHandler, Response } from 'express';
import type { Logger } from 'pino';

/** Ids we accept from the caller (the gateway): letters, digits and . _ : -, 8 to 128 long. */
const VALID_ID = /^[A-Za-z0-9._:-]{8,128}$/;

/**
 * Gives every request an id: the caller's X-Request-Id when it looks like one, else a new UUIDv7.
 * The id goes back in the response header and into every log line and error body.
 */
export function requestId(): RequestHandler {
  return (req, res, next) => {
    const incoming = req.get(HEADERS.requestId);
    const id = incoming !== undefined && VALID_ID.test(incoming) ? incoming : uuidv7();
    res.locals.requestId = id;
    res.setHeader(HEADERS.requestId, id);
    next();
  };
}

/** The request id set by `requestId()`. */
export function requestIdOf(res: Response): string {
  const id: unknown = res.locals.requestId;
  return typeof id === 'string' ? id : 'unknown';
}

/**
 * One log line per finished request: method, path (no query: it can carry personal data), status,
 * duration and request id. `quietPaths` (health checks) are not logged.
 */
export function accessLog(
  logger: Logger,
  options: { quietPaths?: readonly string[] } = {},
): RequestHandler {
  const quiet = new Set(options.quietPaths ?? []);
  return (req, res, next) => {
    if (quiet.has(req.path)) {
      next();
      return;
    }
    const started = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      logger.info(
        {
          requestId: requestIdOf(res),
          method: req.method,
          path: req.path,
          status: res.statusCode,
          ms: Math.round(ms),
        },
        'request',
      );
    });
    next();
  };
}
