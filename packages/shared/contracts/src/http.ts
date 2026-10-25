import type { output, ZodType } from '@beautinique/shared-zod';
import { array, coerce, number, object, string, union } from '@beautinique/shared-zod';

/** Error codes every deployable uses, with their HTTP status. Modules add their own codes the same way. */
export const ERROR_CODES = {
  BAD_REQUEST: 400,
  VALIDATION_FAILED: 400,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  UNAUTHENTICATED: 401,
  SESSION_EXPIRED: 401,
  STEP_UP_REQUIRED: 401,
  FORBIDDEN: 403,
  APP_NOT_ALLOWED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IDEMPOTENCY_KEY_IN_USE: 409,
  PAYLOAD_TOO_LARGE: 413,
  IDEMPOTENCY_KEY_REUSED: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
  UPSTREAM_TIMEOUT: 504,
} as const satisfies Record<string, number>;
export type CommonErrorCode = keyof typeof ERROR_CODES;

/** Error codes are UPPER_SNAKE_CASE. */
export const errorCode = string().regex(/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/, 'Use UPPER_SNAKE_CASE');

/** The body of every error response. `details` lists field problems (validation). */
export const errorBody = object({
  error: object({
    code: errorCode,
    message: string(),
    details: array(
      object({
        path: array(union([string(), number()])),
        message: string(),
      }),
    ).optional(),
    requestId: string(),
  }),
});
export type ErrorBody = output<typeof errorBody>;

/** The body of every success response: `{ data }`. */
export const successBody = <Data extends ZodType>(data: Data) => object({ data });

/** Query of a cursor-paginated list. */
export const cursorQuery = object({
  cursor: string().min(1).max(512).optional(),
  limit: coerce.number().int().min(1).max(100).default(20),
});

/** One page of a cursor-paginated list; `nextCursor` is null on the last page. */
export const cursorPage = <Item extends ZodType>(item: Item) =>
  object({ items: array(item), nextCursor: string().nullable() });
