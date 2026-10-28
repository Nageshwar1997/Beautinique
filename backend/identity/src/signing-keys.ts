import { createPrivateKey, type KeyObject } from 'node:crypto';

import {
  type CryptoKeys,
  decryptField,
  encryptField,
  generateSigningKey,
  type PublicJwk,
} from '@beautinique/backend-server-crypto';
import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';

/**
 * identity's ES256 token keys (ARCHITECTURE §7.2), in its own database: the private key sealed
 * with IDENTITY__FIELD_KEYS, so no new secret goes into Render. A new key every 30 days; the JWKS
 * keeps the older one a day longer, past every token it signed (10 minutes) and every gateway's
 * cache of the JWKS.
 */
export const SIGNING_KEYS = 'identity_signing_keys';
export const ROTATE_AFTER_MS = 30 * 24 * 60 * 60_000;
export const PUBLISH_FOR_MS = ROTATE_AFTER_MS + 24 * 60 * 60_000;
/** How long a process keeps the keys it read before reading them again. */
export const KEY_CACHE_MS = 5 * 60_000;

export interface SigningKeyRecord {
  /** The key id (`kid`) */
  _id: string;
  /** PKCS #8 PEM, sealed (context privateKeyContext) */
  privateKey: string;
  publicJwk: PublicJwk;
  createdAt: Date;
}

const privateKeyContext = (kid: string): string => `${SIGNING_KEYS}.privateKey:${kid}`;

export const indexes: readonly IndexSpec[] = [
  { collection: SIGNING_KEYS, name: 'createdAt', key: { createdAt: -1 } },
];

export interface SigningKeys {
  /** The newest key, made first if there is none or it is 30 days old. */
  current(): Promise<{ kid: string; privateKey: KeyObject }>;
  /** The public keys a token of ours may carry: the JWKS. */
  jwks(): Promise<PublicJwk[]>;
}

export function signingKeys({
  mongo,
  keys,
  now = Date.now,
}: {
  mongo: Mongo;
  keys: CryptoKeys;
  now?: () => number;
}): SigningKeys {
  const collection = mongo.db.collection<SigningKeyRecord>(SIGNING_KEYS);
  let cached: { at: number; records: SigningKeyRecord[] } | undefined;
  const opened = new Map<string, KeyObject>();

  async function published(): Promise<SigningKeyRecord[]> {
    if (cached && now() - cached.at < KEY_CACHE_MS) return cached.records;
    const records = await collection
      .find({ createdAt: { $gt: new Date(now() - PUBLISH_FOR_MS) } })
      .sort({ createdAt: -1 })
      .toArray();
    cached = { at: now(), records };
    return records;
  }

  return {
    async current() {
      let [newest] = await published();
      if (!newest || now() - newest.createdAt.getTime() >= ROTATE_AFTER_MS) {
        // two processes may both make one: both are published, tokens of either verify
        const made = generateSigningKey();
        newest = {
          _id: made.kid,
          privateKey: encryptField(keys, made.privateKeyPem, privateKeyContext(made.kid)),
          publicJwk: made.publicJwk,
          createdAt: new Date(now()),
        };
        await collection.insertOne(newest);
        cached = undefined;
      }
      let privateKey = opened.get(newest._id);
      if (!privateKey) {
        privateKey = createPrivateKey(
          decryptField(keys, newest.privateKey, privateKeyContext(newest._id)),
        );
        opened.set(newest._id, privateKey);
      }
      return { kid: newest._id, privateKey };
    },
    async jwks() {
      return (await published()).map((record) => record.publicJwk);
    },
  };
}
