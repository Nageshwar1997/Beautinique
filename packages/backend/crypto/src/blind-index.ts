import { checkService, fieldPath, type IndexPlace } from './context.ts';
import { currentKeyOf, keysOf, type Keyring } from './keyring.ts';
import { mac, parseMac, textProblem } from './mac.ts';
import { toBase64url } from './utils/base64url.ts';

// The blind index of an encrypted field (docs/ARCHITECTURE.md §10.3 rule 6): HMAC-SHA256 with the
// service's `blind` keyring, never the `field` one, over the field's place and the value. The same
// value in two fields gives two unrelated indexes. The caller gives the value in its one normal
// form (a PAN in capitals, a phone as `+91XXXXXXXXXX`), so one value has one index.

const VERSION = 'b1';
const PURPOSE = 'blind';

export interface BlindIndexOptions {
  service: string;
  /** The service's `blind` keyring, from its config. */
  keys: Keyring;
}

export interface BlindIndex {
  readonly service: string;
  /** `b1.<keyId>.<mac>` with the current key: what is stored next to the encrypted value. */
  indexOf(value: string, place: IndexPlace): string;
  /**
   * The value's index under every key of the keyring, the current one first: what to look for
   * (`{ panIndex: { $in: ... } }`), so a record still indexed with an old key is found too.
   */
  lookupValues(value: string, place: IndexPlace): string[];
  /** Whether an index is made with the current key: one that is not is made again from the value. */
  isCurrent(index: string): boolean;
  /** What an index made with an old key starts with (`b1.k1.`), to find the records to index again. */
  readonly stalePrefixes: readonly string[];
}

/** The blind indexes of one service, with its `blind` keyring (SR-063). */
export function createBlindIndex({ service, keys }: BlindIndexOptions): BlindIndex {
  checkService(service);
  const currentKey = currentKeyOf(keys);
  const currentId = keys.currentId;
  const all = [...keysOf(keys)];

  const checked = (value: string, place: IndexPlace): string => {
    const path = fieldPath(service, place);
    const problem = textProblem(value);
    if (problem !== undefined) throw new RangeError(`The value of ${path} ${problem}.`);
    return path;
  };
  const indexText = (id: string, digest: Buffer) => `${VERSION}.${id}.${toBase64url(digest)}`;

  return Object.freeze({
    service,
    indexOf(value: string, place: IndexPlace) {
      const path = checked(value, place);
      return indexText(currentId, mac(currentKey, PURPOSE, path, value));
    },
    lookupValues(value: string, place: IndexPlace) {
      const path = checked(value, place);
      return all.map(([id, key]) => indexText(id, mac(key, PURPOSE, path, value)));
    },
    isCurrent: (index: string) => parseMac(index, VERSION)?.keyId === currentId,
    stalePrefixes: Object.freeze(keys.ids.slice(1).map((id) => `${VERSION}.${id}.`)),
  });
}
