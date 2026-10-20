import * as z from 'zod';

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
export const errorCode = z
  .string()
  .regex(/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/, 'Use UPPER_SNAKE_CASE');

/** The body of every error response. `details` lists field problems (validation). */
export const errorBody = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    details: z
      .array(
        z.object({
          path: z.array(z.union([z.string(), z.number()])),
          message: z.string(),
        }),
      )
      .optional(),
    requestId: z.string(),
  }),
});
export type ErrorBody = z.infer<typeof errorBody>;

/** The body of every success response: `{ data }`. */
export const successBody = <Data extends z.ZodType>(data: Data) => z.object({ data });

/** Query of a cursor-paginated list. */
export const cursorQuery = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** One page of a cursor-paginated list; `nextCursor` is null on the last page. */
export const cursorPage = <Item extends z.ZodType>(item: Item) =>
  z.object({ items: z.array(item), nextCursor: z.string().nullable() });
