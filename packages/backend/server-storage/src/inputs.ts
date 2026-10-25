import {
  type input,
  int,
  type output,
  strictObject,
  string,
  uuidv7Zod,
  type ZodType,
} from '@beautinique/shared-zod';

import { StorageError } from './errors';
import { keyZod, purposeZod, visibilityZod } from './keys';

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const MAX_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
export const MAX_WIDTH = 4096;
/** Cloudinary's Admin API gives at most 500 per page, so no adapter promises more. */
export const MAX_LIST_LIMIT = 500;

const secondsZod = (fallback: number) => int().min(1).max(MAX_EXPIRY_SECONDS).default(fallback);

/** A MIME type without parameters: `image/jpeg`, `application/pdf`. */
const contentTypeZod = string()
  .max(127)
  .regex(
    /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/,
    'Content type looks like image/jpeg',
  );

export const createUploadInputZod = strictObject({
  assetId: uuidv7Zod,
  purpose: purposeZod,
  visibility: visibilityZod,
  contentType: contentTypeZod,
  maxBytes: int().min(1).max(MAX_UPLOAD_BYTES),
  /** How long the signed upload works. */
  expiresInSeconds: secondsZod(900),
});

export const getUrlInputZod = strictObject({
  key: keyZod,
  /** Images: ask for a version this many pixels wide. */
  width: int().min(1).max(MAX_WIDTH).optional(),
  /** Private files: how long the signed URL works. Public URLs do not expire. */
  expiresInSeconds: secondsZod(300),
});

export const copyInputZod = strictObject({
  /** The key of the file to copy. */
  from: keyZod,
  /** The new asset the copy belongs to. */
  assetId: uuidv7Zod,
  purpose: purposeZod,
  visibility: visibilityZod,
});

export const listInputZod = strictObject({
  /** Only keys that start with this, e.g. `public/product.image/`. */
  prefix: string().max(512).default(''),
  /** `nextCursor` of the previous page. */
  cursor: string().max(1024).optional(),
  limit: int().min(1).max(MAX_LIST_LIMIT).default(100),
});

/** What callers pass (defaults optional) ... */
export type CreateUploadInput = input<typeof createUploadInputZod>;
export type GetUrlInput = input<typeof getUrlInputZod>;
export type CopyInput = input<typeof copyInputZod>;
export type ListInput = input<typeof listInputZod>;
/** ... and what an adapter gets after `parseInput` (defaults filled in). */
export type ParsedCreateUploadInput = output<typeof createUploadInputZod>;
export type ParsedGetUrlInput = output<typeof getUrlInputZod>;
export type ParsedCopyInput = output<typeof copyInputZod>;
export type ParsedListInput = output<typeof listInputZod>;

/** Checks input with a schema above, so every adapter refuses the same things the same way. */
export function parseInput<Schema extends ZodType>(
  schema: Schema,
  value: unknown,
  what: string,
): output<Schema> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const where = issue?.path.length ? `${issue.path.join('.')}: ` : '';
  throw new StorageError('INVALID_INPUT', `${what}: ${where}${issue?.message ?? 'wrong input'}`, {
    cause: result.error,
  });
}

/** A key that `assetKey` made. */
export function parseKeyInput(key: unknown, what: string): string {
  return parseInput(keyZod, key, what);
}
