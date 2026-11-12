import {
  type ClientSession,
  type IndexSpec,
  type Mongo,
  syncIndexes,
} from '@beautinique/backend-server-mongo';
import type { Migration } from '@beautinique/backend-server-release';
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
    /** The breach check could not answer when it was set: checked at the next sign-in (QA DR-002) */
    hibpPending?: true;
    /** That later check found it leaked: no sign-in with it until a new one is set */
    breachedAt?: Date;
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

/**
 * One Google (LinkedIn, GitHub) account belongs to one of ours. The filter takes every non-empty
 * string, so a plain `{ provider, subject }` query reads this index (QA-ID-002: with the filter
 * `$type: 'string'` none did, and every social sign-in read the whole collection). A password row's
 * null subject stays out of it; a provider's id is never empty (oauth-providers.ts checks it).
 */
export const PROVIDER_SUBJECT_INDEX: IndexSpec = {
  collection: AUTH_PROVIDERS,
  name: 'provider_subject_linked_unique',
  key: { provider: 1, subject: 1 },
  unique: true,
  partialFilterExpression: { subject: { $gt: '' } },
};

/** The provider-id index's name before QA-ID-002; providerSubjectIndexMigration drops it. */
const OLD_PROVIDER_SUBJECT_INDEX = 'provider_subject_unique';

export const indexes: readonly IndexSpec[] = [
  {
    collection: AUTH_PROVIDERS,
    name: 'userId_provider_unique',
    key: { userId: 1, provider: 1 },
    unique: true,
  },
  PROVIDER_SUBJECT_INDEX,
];

/**
 * The lookup by a provider's id: whose account it is. `$type: 'string'` keeps it on an index
 * whatever that index's filter (the old one took only a query that said so; QA-ID-002).
 */
export const bySubject = (provider: Provider, subject: string) => ({
  provider,
  subject: { $eq: subject, $type: 'string' as const },
});

/**
 * QA-ID-002: the provider-id index has a new shape, so a new name (RULES §1.14). The new index is
 * made first and the old one dropped after it, so a provider's id is never without a unique index,
 * and the release still running works with either. Safe to run again.
 */
export const providerSubjectIndexMigration: Migration = {
  id: '20261108-001-provider-subject-index',
  description:
    'The provider-id index takes a plain lookup (QA-ID-002): the new shape, then the old goes',
  async up({ mongo, logger }) {
    await syncIndexes(mongo, [PROVIDER_SUBJECT_INDEX]);
    const providers = mongo.db.collection(AUTH_PROVIDERS);
    const old = (await providers.indexes()).some(
      (index) => index.name === OLD_PROVIDER_SUBJECT_INDEX,
    );
    if (old) await providers.dropIndex(OLD_PROVIDER_SUBJECT_INDEX);
    logger.info({ droppedOld: old }, 'the provider-id index has its new shape');
  },
};

/** Sets (or replaces) an account's password, and records `password` as a way it signs in. */
/** A new password, ready to keep: its hash, and whether the breach check could answer. */
export interface NewPassword {
  /** argon2id, made before the code was used up */
  hash: string;
  /** The breach check could not answer: checked again at the next sign-in (QA DR-002) */
  hibpPending: boolean;
}

export async function storePassword(
  mongo: Mongo,
  session: ClientSession,
  { userId, password, now }: { userId: string; password: NewPassword; now: Date },
): Promise<void> {
  // a whole new password: an old mark (pending, leaked) goes with the old one
  const kept = {
    hash: password.hash,
    setAt: now,
    ...(password.hibpPending ? { hibpPending: true as const } : {}),
  };
  await mongo.db
    .collection<Credentials>(CREDENTIALS)
    .updateOne(
      { _id: userId },
      { $set: { password: kept, updatedAt: now } },
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
