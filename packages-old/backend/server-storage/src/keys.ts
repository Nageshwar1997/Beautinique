import { enum as zodEnum, string } from '@beautinique/shared-zod';

import { StorageError } from './errors';

export const VISIBILITIES = ['public', 'private'] as const;
/** `public` files are served openly from the CDN; `private` ones only through short-lived signed URLs. */
export type Visibility = (typeof VISIBILITIES)[number];

export const visibilityZod = zodEnum(VISIBILITIES, { error: 'Visibility is public or private' });

/** What the file is for, in dotted lower case: `product.image`, `seller.kyc_document`. */
export const purposeZod = string()
  .max(64)
  .regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/, 'Purpose looks like product.image');

// the asset's id: its media_assets record's ObjectId, in lower-case hex (owner, 2026-11-12)
const ASSET_ID = /^[0-9a-f]{24}$/;

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
  return parsedVisibility.success &&
    parsedPurpose.success &&
    assetId !== undefined &&
    ASSET_ID.test(assetId)
    ? { visibility: parsedVisibility.data, purpose: parsedPurpose.data, assetId }
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
      'An asset key needs an ObjectId asset id, a purpose like product.image and a visibility',
    );
  }
  return key;
}
