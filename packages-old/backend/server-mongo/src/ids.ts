import { AppError } from '@beautinique/backend-server-kit';
import { ObjectId } from 'mongodb';

// 24 hex, nothing else, whatever the driver's own check allows (older bson took any 12 characters)
const HEX_ID = /^[0-9a-f]{24}$/i;

/**
 * The ObjectId in a 24-hex string (either case), or undefined for anything else: an id from a
 * cookie or a token, where a bad one just means "no such record" and the caller answers for it.
 * An ObjectId is not a secret (time, a per-process random part and a counter), so it never stands
 * in for a check: every route still checks permission and scope (owner, 2026-11-12).
 */
export function parseObjectId(value: unknown): ObjectId | undefined {
  return typeof value === 'string' && HEX_ID.test(value) ? new ObjectId(value) : undefined;
}

/**
 * The ObjectId of an id from a request (path, query, body, a passport). Anything else is the
 * client's mistake, never a 500: 400 VALIDATION_FAILED for `field`, or 404 NOT_FOUND with
 * `notFound` as the message when the id names a record (an id that cannot exist is a record that
 * does not exist). Contracts check ids with objectIdZod first, so this is the second line.
 */
export function toObjectId(
  value: unknown,
  options: { field?: string; notFound?: string } = {},
): ObjectId {
  const id = parseObjectId(value);
  if (id) return id;
  if (options.notFound !== undefined) throw new AppError('NOT_FOUND', options.notFound);
  const message = 'Not a valid id';
  throw new AppError('VALIDATION_FAILED', message, {
    details: [{ path: [options.field ?? 'id'], message }],
  });
}
