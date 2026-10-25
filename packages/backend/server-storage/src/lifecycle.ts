import { StorageError } from './errors';

/**
 * Where an asset is in its life (ARCHITECTURE §6.7), kept in the `media_assets` registry:
 * `UNUSED` (uploaded, no record uses it yet) → `USED` (a record uses it) → `DELETING` (the record
 * let it go; the provider delete is queued) → `DELETED`. Unused uploads that nobody picked up also
 * go straight to `DELETING` (the daily clean-up).
 */
export const ASSET_STATUSES = ['UNUSED', 'USED', 'DELETING', 'DELETED'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

const NEXT: Record<AssetStatus, readonly AssetStatus[]> = {
  UNUSED: ['USED', 'DELETING'],
  USED: ['DELETING'],
  DELETING: ['DELETED'],
  DELETED: [],
};

/** Is `from` → `to` a step an asset may take? Nothing comes back from `DELETING`. */
export const canMoveAsset = (from: AssetStatus, to: AssetStatus): boolean =>
  NEXT[from].includes(to);

/** `canMoveAsset`, as an error for the registry to throw before it writes. */
export function assertAssetMove(from: AssetStatus, to: AssetStatus): void {
  if (!canMoveAsset(from, to)) {
    throw new StorageError('INVALID_INPUT', `An asset cannot go from ${from} to ${to}`);
  }
}
