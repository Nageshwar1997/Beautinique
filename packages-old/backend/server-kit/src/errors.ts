import { type CommonErrorCode, ERROR_CODES, type ErrorBody } from '@beautinique/shared-contracts';
import { ZodError } from '@beautinique/shared-zod';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from 'pino';

import { reportError } from './monitoring';
import { requestIdOf } from './request';

export interface ErrorDetail {
  path: (string | number)[];
  message: string;
}

/**
 * An error the client should see: a code from ERROR_CODES (its HTTP status comes with it), or a
 * module's own code with an explicit status. The message is shown to the user, so keep it plain.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ErrorDetail[] | undefined;

  constructor(
    code: CommonErrorCode | (string & {}),
    message: string,
    options: { status?: number; details?: ErrorDetail[]; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    const status = options.status ?? (ERROR_CODES as Record<string, number>)[code];
    if (status === undefined || status < 400 || status > 599) {
      throw new Error(
        `AppError "${code}" needs a 4xx or 5xx status (it is not a common error code)`,
      );
    }
    this.code = code;
    this.status = status;
    this.details = options.details;
  }
}

interface HttpLikeError {
  type?: unknown;
  status?: unknown;
}

/** The status and body (contracts `errorBody`) for anything a handler throws. */
export function toErrorResponse(
  error: unknown,
  requestId: string,
): { status: number; body: ErrorBody } {
  const body = (code: string, message: string, details?: ErrorDetail[]) => ({
    error: { code, message, ...(details ? { details } : {}), requestId },
  });
  if (error instanceof AppError) {
    return { status: error.status, body: body(error.code, error.message, error.details) };
  }
  if (error instanceof ZodError) {
    return {
      status: ERROR_CODES.VALIDATION_FAILED,
      body: body(
        'VALIDATION_FAILED',
        'Some fields are not valid.',
        error.issues.map((issue) => ({
          path: issue.path.map((part) => (typeof part === 'symbol' ? String(part) : part)),
          message: issue.message,
        })),
      ),
    };
  }
  // express.json() errors
  const http = (typeof error === 'object' && error !== null ? error : {}) as HttpLikeError;
  if (http.type === 'entity.too.large') {
    return { status: 413, body: body('PAYLOAD_TOO_LARGE', 'The request body is too large.') };
  }
  if (http.type === 'entity.parse.failed') {
    return { status: 400, body: body('BAD_REQUEST', 'The request body is not valid JSON.') };
  }
  if (typeof http.status === 'number' && http.status >= 400 && http.status < 500) {
    return { status: http.status, body: body('BAD_REQUEST', 'The request is not valid.') };
  }
  return {
    status: 500,
    body: body('INTERNAL', 'Something went wrong on our side. Please try again.'),
  };
}

/**
 * The last middleware: every error becomes the contracts error body. Server errors are logged with
 * their stack and sent to Sentry when it is on; their real message never reaches the client.
 */
export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const requestId = requestIdOf(res);
    const { status, body } = toErrorResponse(error, requestId);
    if (status >= 500) {
      logger.error({ err: error, requestId, method: req.method, path: req.path }, 'request failed');
      reportError(error, { requestId, method: req.method, path: req.path });
    }
    res.status(status).json(body);
  };
}

/** For paths no route matched: a NOT_FOUND error body. */
export function notFound(): RequestHandler {
  return (req, _res, next) => {
    next(new AppError('NOT_FOUND', `No route for ${req.method} ${req.path}`));
  };
}
