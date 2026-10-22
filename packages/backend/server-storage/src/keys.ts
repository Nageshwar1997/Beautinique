import { enum as zodEnum, string, uuidv7Zod } from '@beautinique/shared-zod';

import { StorageError } from './errors';

export const VISIBILITIES = ['public', 'private'] as const;
/** `public` files are served openly from the CDN; `private` ones only through short-lived signed URLs. */
export type Visibility = (typeof VISIBILITIES)[number];

export const visibilityZod = zodEnum(VISIBILITIES, { error: 'Visibility is public or private' });

/** What the file is for, in dotted lower case: `product.image`, `seller.kyc_document`. */
export const purposeZod = string()
  .max(64)
  .regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/, 'Purpose looks like product.image');

export interface ParsedKey {
  visibility: Visibility;
  purpose: string;
  assetId: string;
}

/** The parts of a key made by `assetKey`, or `undefined` for anything else. */
export function parseKey(key: string): ParsedKey | undefined {
  const [visibility, purpose, assetId, ...rest] = key.split('/');
  if (rest.length > 0) return undefined;
  const parsedVisibility = visibilityZod.safeParse(visibility);
  const parsedPurpose = purposeZod.safeParse(purpose);
  const parsedAssetId = uuidv7Zod.safeParse(assetId);
  return parsedVisibility.success && parsedPurpose.success && parsedAssetId.success
    ? {
        visibility: parsedVisibility.data,
        purpose: parsedPurpose.data,
        assetId: parsedAssetId.data,
      }
    : undefined;
}

/** A key made by `assetKey`. Nothing else is a key: no path tricks reach a provider. */
export const keyZod = string().refine(
  (key) => parseKey(key) !== undefined,
  'Key looks like public/product.image/<asset id>',
);

/**
 * The provider key of an asset: `<visibility>/<purpose>/<assetId>`. Every adapter uses this one
 * format, so moving files between providers keeps their keys, and a key tells whether a file is
 * public or private.
 */
export function assetKey(assetId: string, purpose: string, visibility: Visibility): string {
  const key = `${visibility}/${purpose}/${assetId}`;
  if (parseKey(key) === undefined) {
    throw new StorageError(
      'INVALID_INPUT',
      'An asset key needs a UUIDv7 asset id, a purpose like product.image and a visibility',
    );
  }
  return key;
}
