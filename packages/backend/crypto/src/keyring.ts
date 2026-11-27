import { createSecretKey, randomBytes, type KeyObject } from 'node:crypto';
import { inspect } from 'node:util';

import { NEVER, string } from 'zod';

import { fromBase64url, toBase64url } from './utils/base64url.ts';

/** A key's id: small letters and digits, up to 16 (`k2`, `2026a`). It is in every value it makes. */
export const KEY_ID = /^[a-z0-9]{1,16}$/;
const KEY_BYTES = 32;
const MAX_KEYS = 16;

interface Secrets {
  current: KeyObject;
  byId: ReadonlyMap<string, KeyObject>;
}

// The keys of each keyring, out of the object itself: a keyring that is logged, printed or turned
// into JSON shows its name and its key ids, never a key (SR-077). Only this package reads them.
const secrets = new WeakMap<Keyring, Secrets>();

/**
 * The keys of one kind, from one config key (`IDENTITY_FIELD_KEYS`): the first is the current one,
 * which every new value is made with, and the others only open what they made, until the daily
 * re-encrypt has moved it to the current key (docs/ARCHITECTURE.md §10.3 rule 5).
 */
export class Keyring {
  /** The config key it came from, for messages. */
  readonly name: string;
  /** Every key's id, the current one first. */
  readonly ids: readonly string[];

  /** Made by `parseKeyring`; `keys` in order, the current one first. */
  constructor(name: string, keys: ReadonlyMap<string, KeyObject>) {
    const [current] = keys.values();
    if (current === undefined) throw new RangeError(`${name} has no key.`);
    this.name = name;
    this.ids = Object.freeze([...keys.keys()]);
    secrets.set(this, { current, byId: keys });
    Object.freeze(this);
  }

  /** The id of the key new values are made with. */
  get currentId(): string {
    return this.ids[0] as string;
  }

  toJSON(): { name: string; ids: readonly string[] } {
    return { name: this.name, ids: this.ids };
  }

  [inspect.custom](): string {
    return `Keyring(${this.name}: ${this.ids.join(', ')})`;
  }
}

function secretsOf(ring: Keyring): Secrets {
  const found = secrets.get(ring);
  // A plain object of the same shape type-checks as a Keyring; it has no keys.
  if (found === undefined) throw new RangeError('The keys must be a keyring from parseKeyring.');
  return found;
}

/** The key with that id, for this package's own modules; never exported from the package. */
export function keyOf(ring: Keyring, id: string): KeyObject | undefined {
  return secretsOf(ring).byId.get(id);
}

/** Every key by its id, the current one first, for this package's own modules. */
export function keysOf(ring: Keyring): ReadonlyMap<string, KeyObject> {
  return secretsOf(ring).byId;
}

/** The key new values are made with, for this package's own modules. */
export function currentKeyOf(ring: Keyring): KeyObject {
  return secretsOf(ring).current;
}

/**
 * A keyring from its config text, `<id>:<key>` pairs joined by `,`, the current key first, each key
 * 32 random bytes in base64url: `k2:...,k1:...`. Anything wrong is a `RangeError` that names the
 * config key and the entry, and never a key.
 */
export function parseKeyring(text: unknown, name: string): Keyring {
  if (typeof text !== 'string' || text === '') throw new RangeError(`${name} is empty.`);
  const entries = text.split(',');
  if (entries.length > MAX_KEYS) {
    throw new RangeError(`${name} has more than ${String(MAX_KEYS)} keys.`);
  }
  const keys = new Map<string, KeyObject>();
  const seen = new Set<string>();
  for (const [index, entry] of entries.entries()) {
    const where = `${name}: entry ${String(index + 1)}`;
    const colon = entry.indexOf(':');
    if (colon < 1) throw new RangeError(`${where} is not <id>:<key>.`);
    const id = entry.slice(0, colon);
    if (!KEY_ID.test(id)) {
      throw new RangeError(`${where} has a key id that is not small letters and digits, up to 16.`);
    }
    if (keys.has(id)) throw new RangeError(`${name}: the key id ${id} is given twice.`);
    const bytes = fromBase64url(entry.slice(colon + 1));
    if (bytes?.length !== KEY_BYTES) {
      throw new RangeError(
        `${name}: the key ${id} is not ${String(KEY_BYTES)} bytes in base64url.`,
      );
    }
    const fingerprint = bytes.toString('hex');
    if (seen.has(fingerprint)) {
      throw new RangeError(`${name}: the key ${id} is the same as an earlier key.`);
    }
    seen.add(fingerprint);
    keys.set(id, createSecretKey(bytes));
    bytes.fill(0);
  }
  return new Keyring(name, keys);
}

/**
 * The schema of a keyring in a service's config (`@beautinique/backend-config`):
 * `IDENTITY_FIELD_KEYS: keyringSchema('IDENTITY_FIELD_KEYS')`. Its messages name the key.
 */
export function keyringSchema(name: string) {
  return string(`${name} is required.`).transform((text, ctx) => {
    try {
      return parseKeyring(text, name);
    } catch (error) {
      // parseKeyring throws only its own RangeError, whose message names the key and no value.
      ctx.addIssue({ code: 'custom', message: (error as RangeError).message });
      return NEVER;
    }
  });
}

/** A new key's config text, `<id>:<32 random bytes>`, to put first in a keyring. */
export function newKeyText(id: string): string {
  if (!KEY_ID.test(id)) {
    throw new RangeError('A key id is small letters and digits, up to 16.');
  }
  return `${id}:${toBase64url(randomBytes(KEY_BYTES))}`;
}
