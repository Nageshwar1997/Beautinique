import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import { withTransaction } from '@beautinique/backend-server-mongo';
import type { AppId, OTP_OUTCOMES } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

import { hasPassword, storePassword } from './credentials.ts';

export const USERS = 'identity_users';
export const LEGAL_ACCEPTANCES = 'identity_legal_acceptances';

/**
 * One sign-in account per email (ARCHITECTURE §7.1); the phone is contact data, never a login.
 * Credentials and sign-in ways live in identity_credentials and identity_auth_providers; grants and
 * sessions in their own (T3.2, T3.3).
 */
export interface User {
  _id: string;
  /** Lower case, as emailZod gives it; unique */
  email: string;
  status: 'active';
  emailVerifiedAt: Date;
  /** When the person declared being 18 or older (customer app, PRD §2); null until then */
  ageDeclaredAt: Date | null;
  /** The app the account was made in */
  signUpApp: AppId;
  createdAt: Date;
  updatedAt: Date;
}

/** Legal evidence of a consent: who, which documents and version, from which app and IP, when. */
export interface LegalAcceptance {
  _id: string;
  userId: string;
  documents: ('terms' | 'privacy')[];
  version: string;
  /** The 18-or-older declaration came with it */
  adult: boolean;
  app: AppId;
  ip: string;
  acceptedAt: Date;
}

export const indexes: readonly IndexSpec[] = [
  { collection: USERS, name: 'email_unique', key: { email: 1 }, unique: true },
  {
    collection: LEGAL_ACCEPTANCES,
    name: 'userId_acceptedAt',
    key: { userId: 1, acceptedAt: -1 },
  },
];

export interface SignUpWithCode {
  email: string;
  app: AppId;
  /** What the request consented to (sign-up apps ask it every time) */
  consent: { terms: boolean; adult: boolean };
  legalVersion: string;
  ip: string;
  /** The new password's hash (argon2id), made before the code was used up */
  passwordHash: string;
}

/**
 * A right sign-up code (ARCHITECTURE §7.1, one account per email, one password for every app).
 * No account yet: made, with the password (`account-made`). An account without a password (made
 * with Google): the password is added (`password-set`). An account with one: kept as it is
 * (`password-kept`). Each time the app's consent is legal evidence: a first one in this app, a new
 * legal version, or a first 18-or-older declaration is recorded. An upsert, so two codes at once
 * make one account.
 */
export async function signUpWithCode(
  mongo: Mongo,
  { email, app, consent, legalVersion, ip, passwordHash }: SignUpWithCode,
): Promise<{ user: User; outcome: (typeof OTP_OUTCOMES)[number] }> {
  const users = mongo.db.collection<User>(USERS);
  const acceptances = mongo.db.collection<LegalAcceptance>(LEGAL_ACCEPTANCES);
  return withTransaction(mongo, async (session) => {
    const now = new Date();
    const made = await users.updateOne(
      { email },
      {
        $setOnInsert: {
          _id: uuidv7(),
          email,
          status: 'active',
          emailVerifiedAt: now,
          ageDeclaredAt: consent.adult ? now : null,
          signUpApp: app,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, session },
    );
    const isNewUser = made.upsertedCount === 1;
    const user = await users.findOne({ email }, { session });
    if (!user) throw new Error('the account just written is not there');
    let declaredNow = false;
    if (!isNewUser && consent.adult && user.ageDeclaredAt === null) {
      await users.updateOne(
        { _id: user._id },
        { $set: { ageDeclaredAt: now, updatedAt: now } },
        { session },
      );
      user.ageDeclaredAt = now;
      declaredNow = true;
    }
    if (consent.terms) {
      // one row per new consent: per app and legal version, not per code
      const known = await acceptances.findOne(
        { userId: user._id, app, version: legalVersion },
        { session, projection: { _id: 1 } },
      );
      if (isNewUser || declaredNow || !known) {
        await acceptances.insertOne(
          {
            _id: uuidv7(),
            userId: user._id,
            documents: ['terms', 'privacy'],
            version: legalVersion,
            adult: consent.adult,
            app,
            ip,
            acceptedAt: now,
          },
          { session },
        );
      }
    }
    if (!isNewUser && (await hasPassword(mongo, user._id, session))) {
      return { user, outcome: 'password-kept' as const };
    }
    await storePassword(mongo, session, { userId: user._id, hash: passwordHash, now });
    return { user, outcome: isNewUser ? ('account-made' as const) : ('password-set' as const) };
  });
}

/**
 * A right password code: the account's password is set, the first one or a new one. Null when the
 * account went away after the code was sent.
 */
export async function setPasswordWithCode(
  mongo: Mongo,
  { email, passwordHash }: { email: string; passwordHash: string },
): Promise<User | null> {
  return withTransaction(mongo, async (session) => {
    const user = await mongo.db.collection<User>(USERS).findOne({ email }, { session });
    if (!user) return null;
    await storePassword(mongo, session, { userId: user._id, hash: passwordHash, now: new Date() });
    return user;
  });
}
