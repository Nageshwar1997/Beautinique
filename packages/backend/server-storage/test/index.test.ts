import { uuidv7 } from '@beautinique/shared-utils';
import { describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  assertAssetMove,
  ASSET_STATUSES,
  assetKey,
  canMoveAsset,
  createMemoryStorage,
  parseKey,
  StorageError,
} from '../src/index';
import { storageContract, TINY_PNG } from '../src/testing';

describe('public API', () => {
  it('exports exactly these', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'ASSET_STATUSES',
        'MAX_EXPIRY_SECONDS',
        'MAX_LIST_LIMIT',
        'MAX_UPLOAD_BYTES',
        'MAX_WIDTH',
        'StorageError',
        'VISIBILITIES',
        'assertAssetMove',
        'assetKey',
        'canMoveAsset',
        'copyInputZod',
        'createMemoryStorage',
        'createUploadInputZod',
        'getUrlInputZod',
        'keyZod',
        'listInputZod',
        'parseInput',
        'parseKey',
        'parseKeyInput',
        'purposeZod',
        'visibilityZod',
      ].sort(),
    );
  });
});

describe('asset keys', () => {
  const assetId = uuidv7();

  it('are <visibility>/<purpose>/<asset id>, and parse back', () => {
    const key = assetKey(assetId, 'product.image', 'public');
    expect(key).toBe(`public/product.image/${assetId}`);
    expect(parseKey(key)).toEqual({ visibility: 'public', purpose: 'product.image', assetId });
  });

  it('refuse anything that is not a UUIDv7, a dotted lower-case purpose and a visibility', () => {
    expect(() => assetKey('abc', 'product.image', 'public')).toThrow(StorageError);
    expect(() => assetKey(assetId, 'Product', 'public')).toThrow(StorageError);
    expect(() => assetKey(assetId, 'product/image', 'public')).toThrow(StorageError);
    expect(() => assetKey(`${assetId}/x`, 'product', 'public')).toThrow(StorageError);
    expect(() => assetKey(assetId, 'product', 'secret' as never)).toThrow(StorageError);
  });

  it('parseKey knows nothing else: path tricks, extra parts, wrong parts', () => {
    for (const key of [
      '',
      '../etc/passwd',
      `public/product/${assetId}/extra`,
      `public/${assetId}`,
      `internal/product/${assetId}`,
      'public/product/not-an-id',
      `/public/product/${assetId}`,
    ]) {
      expect(parseKey(key), key).toBeUndefined();
    }
  });
});

describe('asset lifecycle', () => {
  it('goes UNUSED → USED → DELETING → DELETED, and unused uploads may be cleaned up', () => {
    const allowed = ASSET_STATUSES.flatMap((from) =>
      ASSET_STATUSES.filter((to) => canMoveAsset(from, to)).map((to) => `${from}>${to}`),
    );
    expect(allowed).toEqual([
      'UNUSED>USED',
      'UNUSED>DELETING',
      'USED>DELETING',
      'DELETING>DELETED',
    ]);
  });

  it('assertAssetMove throws for the rest, naming both ends', () => {
    expect(() => {
      assertAssetMove('UNUSED', 'USED');
    }).not.toThrow();
    expect(() => {
      assertAssetMove('DELETING', 'USED');
    }).toThrow(new StorageError('INVALID_INPUT', 'An asset cannot go from DELETING to USED'));
    expect(() => {
      assertAssetMove('USED', 'USED');
    }).toThrow(StorageError);
  });
});

describe('the contract fixture', () => {
  it('TINY_PNG is a PNG', () => {
    expect([...TINY_PNG.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });
});

storageContract('memory', () => {
  const storage = createMemoryStorage();
  return {
    storage,
    upload: (ticket, body, contentType) => storage.upload(ticket, body, contentType),
  };
});
