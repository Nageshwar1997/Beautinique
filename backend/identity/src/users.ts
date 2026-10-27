import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import { withTransaction } from '@beautinique/backend-server-mongo';
import type { AppId } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

export const USERS = 'identity_users';
export const LEGAL_ACCEPTANCES = 'identity_legal_acceptances';

/**
 * One sign-in account per email (ARCHITECTURE §7.1); the phone is contact data, never a login.
 * Grants, sessions and credentials live in their own collections (T3.2, T3.3).
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

export interface SignInWithCode {
  email: string;
  app: AppId;
  /** A sign-up app's code for an email without an account: make one */
  signUp: boolean;
  /** What the request consented to (sign-up apps ask it every time) */
  consent: { terms: boolean; adult: boolean };
  legalVersion: string;
  ip: string;
}

/**
 * The account behind a right code. In a sign-up app it is made if it is not there yet (an upsert,
 * so two codes at once make one account), with the consent as legal evidence. Consent given at a
 * sign-in counts too: a new legal version, or a first 18-or-older declaration, is recorded. Null
 * when a sign-in finds no account (it went away after the code was sent).
 */
export async function userForCode(
  mongo: Mongo,
  { email, app, signUp, consent, legalVersion, ip }: SignInWithCode,
): Promise<{ user: User; isNewUser: boolean } | null> {
  const users = mongo.db.collection<User>(USERS);
  const acceptances = mongo.db.collection<LegalAcceptance>(LEGAL_ACCEPTANCES);
  return withTransaction(mongo, async (session) => {
    const now = new Date();
    let isNewUser = false;
    if (signUp) {
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
      isNewUser = made.upsertedCount === 1;
    }
    const user = await users.findOne({ email }, { session });
    if (!user) return null;
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
      const latest = await acceptances.findOne(
        { userId: user._id },
        { session, sort: { acceptedAt: -1 }, projection: { version: 1 } },
      );
      // a sign-in with the same version adds nothing: one row per new consent, not per sign-in
      if (isNewUser || declaredNow || latest?.version !== legalVersion) {
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
    return { user, isNewUser };
  });
}
