import { randomBytes } from 'node:crypto';

/** A key id: short, so it fits in every sealed value (`k1`, `k2`, `b1` ...). */
const KEY_ID = /^[a-z][a-z0-9]{0,7}$/;
const KEY_BYTES = 32;

/** A problem with keys or sealed values. Its message never holds key material or field data. */
export class CryptoError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = 'CryptoError';
  }
}

export interface CryptoKeys {
  /** Seals new values with `current`; opens values sealed with any key in `keys` (rotation). */
  encryption: { current: string; keys: ReadonlyMap<string, Buffer> };
  /** One key for blind indexes: changing it means indexing every row again. */
  blindIndex: { id: string; key: Buffer };
}

export interface CryptoKeysConfig {
  /**
   * `id:base64,id:base64...` from the deployable's config (`<NAME>__FIELD_KEYS`). The first key
   * seals; the rest only open older values until a re-encrypt job has moved them over.
   */
  fieldKeys: string;
  /** `id:base64` (`<NAME>__BLIND_INDEX_KEY`). */
  blindIndexKey: string;
}

/** A new random key, as base64 for a `.env` file. */
export function generateKey(): string {
  return randomBytes(KEY_BYTES).toString('base64');
}

function parseKey(entry: string, setting: string): [string, Buffer] {
  const at = entry.indexOf(':');
  const id = entry.slice(0, at).trim();
  if (at <= 0 || !KEY_ID.test(id)) {
    throw new CryptoError(`${setting}: each key must be "<id>:<base64>" with a short id like k1`);
  }
  const key = Buffer.from(entry.slice(at + 1).trim(), 'base64');
  if (key.length !== KEY_BYTES) {
    throw new CryptoError(
      `${setting}: key ${id} must be ${String(KEY_BYTES)} bytes (base64 of 32 random bytes)`,
    );
  }
  return [id, key];
}

/**
 * Reads the keys from config once at start. Wrong config fails the start with a message that names
 * the setting and key id, never the key.
 */
export function loadCryptoKeys({ fieldKeys, blindIndexKey }: CryptoKeysConfig): CryptoKeys {
  const entries = fieldKeys
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => parseKey(entry, 'FIELD_KEYS'));
  const [first] = entries;
  if (!first) throw new CryptoError('FIELD_KEYS: give at least one key');
  const keys = new Map<string, Buffer>();
  for (const [id, key] of entries) {
    if (keys.has(id)) throw new CryptoError(`FIELD_KEYS: key ${id} is listed twice`);
    keys.set(id, key);
  }
  const [indexId, indexKey] = parseKey(blindIndexKey.trim(), 'BLIND_INDEX_KEY');
  for (const key of keys.values()) {
    if (key.equals(indexKey)) {
      throw new CryptoError('BLIND_INDEX_KEY must differ from every FIELD_KEYS key');
    }
  }
  return { encryption: { current: first[0], keys }, blindIndex: { id: indexId, key: indexKey } };
}
