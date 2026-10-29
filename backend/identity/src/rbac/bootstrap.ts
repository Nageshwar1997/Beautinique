import type { Logger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import { emailZod } from '@beautinique/shared-zod';

import type { Config } from '../config.ts';
import { runReleaseSteps } from '../release.ts';
import { type User, USERS } from '../users.ts';
import { activeAt, giveSystemGrant, type GrantRecord, GRANTS } from './grants.ts';
import { MASTER_ROLE, ROLE_SEEDS } from './roles.ts';
import { type RoleRecord, ROLES } from './sync.ts';

export type MasterGrantOutcome = 'given' | 'already-master';

const MASTER_SEATS = ROLE_SEEDS.find((seed) => seed.key === MASTER_ROLE)?.maxHolders ?? 2;

/**
 * The first Master (ARCHITECTURE §7.3): nobody can appoint one, so the owner gives it with
 * `npm run db:grant-master` to an account that already exists (signed up, with a password). At
 * most 2 seats. The account sets up its authenticator at its first Master sign-in.
 */
export async function giveMasterGrant(
  mongo: Mongo,
  { email, now = new Date() }: { email: string; now?: Date },
): Promise<MasterGrantOutcome> {
  const parsed = emailZod.safeParse(email);
  if (!parsed.success) throw new Error(`"${email}" is not an email`);
  return withTransaction(mongo, async (session) => {
    const user = await mongo.db
      .collection<User>(USERS)
      .findOne({ email: parsed.data }, { session });
    if (!user) {
      throw new Error(`No account has ${parsed.data}: sign up in the customer app first.`);
    }
    // a write on the role first: two runs at once for the last seat clash here, and the retried
    // one counts again (two snapshots alone would each see a free seat)
    const claimed = await mongo.db
      .collection<RoleRecord>(ROLES)
      .updateOne({ _id: MASTER_ROLE }, { $inc: { seatClaims: 1 } }, { session });
    if (claimed.matchedCount !== 1)
      throw new Error('The roles are not there: run db:release first.');
    const grants = mongo.db.collection<GrantRecord>(GRANTS);
    const holders = await grants.distinct(
      'userId',
      { role: MASTER_ROLE, ...activeAt(now) },
      {
        session,
      },
    );
    if (holders.includes(user._id)) return 'already-master';
    if (holders.length >= MASTER_SEATS) {
      throw new Error(`Master has ${String(MASTER_SEATS)} seats and both are taken.`);
    }
    await giveSystemGrant(mongo, session, {
      userId: user._id,
      role: MASTER_ROLE,
      app: 'master',
      scope: { type: 'global', ids: [] },
      via: 'bootstrap',
      now,
    });
    return 'given' as const;
  });
}

/**
 * `npm run db:grant-master` (backend/bundle): the release steps first (the roles must be there),
 * then the grant. Connects, does it and closes again.
 */
export async function grantMaster(
  config: Config,
  { email, logger }: { email: string; logger: Logger },
): Promise<MasterGrantOutcome> {
  const mongo = await connectMongo({
    uri: config.mongoUri,
    dbName: config.mongoDbName,
    appName: 'identity-grant-master',
    logger,
  });
  try {
    await runReleaseSteps(mongo, logger);
    const outcome = await giveMasterGrant(mongo, { email });
    logger.info({ outcome }, 'master grant');
    return outcome;
  } finally {
    await mongo.close();
  }
}
