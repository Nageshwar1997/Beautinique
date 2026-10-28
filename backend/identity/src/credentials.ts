import type { ClientSession, IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import type { AUTH_PROVIDERS as PROVIDER_NAMES } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

export const CREDENTIALS = 'identity_credentials';
export const AUTH_PROVIDERS = 'identity_auth_providers';

/** How an account signs in: its password, or one of the customer app's OAuth providers (PR 4). */
export type Provider = (typeof PROVIDER_NAMES)[number];

/**
 * An account's secrets, one document per user (`_id` = the user's id), apart from `identity_users`
 * so that reading an account never reads them. An account made with Google alone has none.
 */
export interface Credentials {
  _id: string;
  password?: {
    /** argon2id PHC string; the password itself is never stored */
    hash: string;
    setAt: Date;
  };
  totp?: {
    /** The authenticator secret, sealed with IDENTITY__FIELD_KEYS (context totpContext) */
    secret: string;
    enrolledAt: Date;
    /** The last time step that signed in: it and older ones never work again */
    lastStep: number;
  };
  /** 10 recovery codes (keyed hashes), each works once */
  recoveryCodes?: { hash: string; usedAt: Date | null }[];
  updatedAt: Date;
}

/** One way an account signs in. `subject` is the provider's user id (null for `password`). */
export interface AuthProvider {
  _id: string;
  userId: string;
  provider: Provider;
  subject: string | null;
  linkedAt: Date;
  lastUsedAt: Date | null;
}

/** The associated data a sealed authenticator secret is bound to: it opens for this account only. */
export const totpContext = (userId: string): string => `${CREDENTIALS}.totp:${userId}`;

export const indexes: readonly IndexSpec[] = [
  {
    collection: AUTH_PROVIDERS,
    name: 'userId_provider_unique',
    key: { userId: 1, provider: 1 },
    unique: true,
  },
  {
    // one Google (LinkedIn, GitHub) account belongs to one of ours
    collection: AUTH_PROVIDERS,
    name: 'provider_subject_unique',
    key: { provider: 1, subject: 1 },
    unique: true,
    partialFilterExpression: { subject: { $type: 'string' } },
  },
];

/** Sets (or replaces) an account's password, and records `password` as a way it signs in. */
export async function storePassword(
  mongo: Mongo,
  session: ClientSession,
  { userId, hash, now }: { userId: string; hash: string; now: Date },
): Promise<void> {
  await mongo.db
    .collection<Credentials>(CREDENTIALS)
    .updateOne(
      { _id: userId },
      { $set: { password: { hash, setAt: now }, updatedAt: now } },
      { upsert: true, session },
    );
  await mongo.db.collection<AuthProvider>(AUTH_PROVIDERS).updateOne(
    { userId, provider: 'password' },
    {
      $setOnInsert: {
        _id: uuidv7(),
        userId,
        provider: 'password',
        subject: null,
        linkedAt: now,
        lastUsedAt: null,
      },
    },
    { upsert: true, session },
  );
}

/** Whether an account signs in with a password. */
export async function hasPassword(
  mongo: Mongo,
  userId: string,
  session?: ClientSession,
): Promise<boolean> {
  const found = await mongo.db
    .collection<AuthProvider>(AUTH_PROVIDERS)
    .findOne({ userId, provider: 'password' }, { session, projection: { _id: 1 } });
  return found !== null;
}
