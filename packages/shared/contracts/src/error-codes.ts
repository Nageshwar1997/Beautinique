import { strictObject, string, unknown, type output } from 'zod';

import type { Service } from './constants/services.ts';

// The status codes of docs/ARCHITECTURE.md §5 rule 9, and 500 for what nobody foresaw.
export const ERROR_STATUSES = [400, 401, 403, 404, 409, 413, 422, 426, 429, 500, 503] as const;

export type ErrorStatus = (typeof ERROR_STATUSES)[number];

const CODE_FORMAT = /^[A-Z][A-Z0-9_]*$/;

/** The codes every service uses, with their status (docs/ARCHITECTURE.md §5 rules 8 and 9). */
export const COMMON_ERRORS = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  /** A fresh authenticator code is asked first (D-185): the app shows its step-up dialog and sends the request again. */
  STEP_UP_REQUIRED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IDEMPOTENCY_IN_PROGRESS: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE: 422,
  IDEMPOTENCY_KEY_REUSED: 422,
  APP_VERSION_TOO_OLD: 426,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * The error codes of one service: each starts with the name of the service, like
 * `COMMERCE_STOCK_UNAVAILABLE` for `defineErrors('commerce', { STOCK_UNAVAILABLE: 409 })`, so two
 * services never use the same code.
 */
export function defineErrors<S extends Service, E extends Readonly<Record<string, ErrorStatus>>>(
  service: S,
  errors: E,
): { readonly [K in keyof E & string as `${Uppercase<S>}_${K}`]: E[K] } {
  const prefix = `${service.toUpperCase()}_`;
  const defined = Object.entries(errors).map(([name, status]) => {
    if (!CODE_FORMAT.test(name)) {
      throw new RangeError(
        `The error code ${name} is in capitals, digits and _, and starts with a letter.`,
      );
    }
    if (!ERROR_STATUSES.includes(status)) {
      throw new RangeError(`The error code ${prefix}${name} has a status that is not in the list.`);
    }
    return [`${prefix}${name}`, status] as const;
  });
  return Object.freeze(Object.fromEntries(defined)) as never;
}

/** The body of every error answer: `{ error: { code, message, details, requestId } }`. */
export const errorBodySchema = strictObject(
  {
    error: strictObject(
      {
        code: string('code is required.').regex(
          CODE_FORMAT,
          'code must be in capitals, digits and _, and start with a letter.',
        ),
        message: string('message is required.'),
        details: unknown(),
        requestId: string('requestId is required.').min(1, 'requestId is required.'),
      },
      'error must be { code, message, details, requestId }.',
    ),
  },
  'The error body must be { error } and nothing else.',
);

export type ErrorBody = output<typeof errorBodySchema>;
