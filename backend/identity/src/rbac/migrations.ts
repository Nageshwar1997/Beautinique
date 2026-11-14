import { withTransaction } from '@beautinique/backend-server-mongo';
import type { Migration } from '@beautinique/backend-server-release';
import type { AppId } from '@beautinique/shared-contracts';

import {
  LEGAL_ACCEPTANCES,
  type LegalAcceptance,
  type User,
  USERS,
  writeUserSnapshot,
} from '../users.ts';
import { type RbacCatalog, rbacCatalog } from './catalog.ts';
import { giveSystemGrant, writeAccessSnapshot } from './grants.ts';
import { SIGN_UP_ROLES } from './roles.ts';
import { writeAllRoleSnapshots } from './sync.ts';

/**
 * Accounts made before grants (T3.1, T3.2) get the role their sign-up gives today, so they can
 * still sign in: Customer for an 18+ declaration, an applicant role for each Seller or Creator
 * sign-up (one legal acceptance per app). Safe to run again: a grant that is there stays one.
 */
export const signUpGrantsMigration: Migration = {
  id: '20261029-001-sign-up-grants',
  description: 'Accounts made before T3.3 get the grant of their sign-up',
  async up({ mongo, logger }) {
    const acceptances = mongo.db.collection<LegalAcceptance>(LEGAL_ACCEPTANCES);
    let given = 0;
    let catalog: RbacCatalog | undefined;
    for await (const user of mongo.db
      .collection<User>(USERS)
      .find({}, { comment: 'full read: every account, once per database' })) {
      catalog ??= await rbacCatalog(mongo);
      const appIds = [
        user.signUpAppId,
        ...(await acceptances.distinct('appId', { userId: user._id })),
      ];
      const known = catalog;
      // an app the release has not written yet (this runs before the rbac step) names no role:
      // an account made since ObjectIds got its grant at sign-up anyway (owner, 2026-11-12)
      const apps = new Set<AppId>(
        appIds.flatMap((id) => {
          try {
            return [known.appOf(id)];
          } catch {
            return [];
          }
        }),
      );
      const roles = [...apps].flatMap((app) => {
        const role = SIGN_UP_ROLES[app];
        if (role === undefined || (app === 'customer' && user.ageDeclaredAt === null)) return [];
        return [{ app, role }];
      });
      for (const { role } of roles) {
        const made = await withTransaction(mongo, (session) =>
          giveSystemGrant(mongo, session, {
            userId: user._id,
            role,
            scope: { type: 'self', ids: [user._id.toHexString()] },
            via: 'migration',
            now: new Date(),
          }),
        );
        if (made) given += 1;
      }
    }
    logger.info({ given }, 'sign-up grants for earlier accounts');
  },
};

/** Accounts per transaction in the first copy: small, so one batch never nears a time limit. */
const SNAPSHOT_BATCH = 50;

/**
 * The first copy for core (TASKS T3.5): every role, every account and every account's grants go
 * out once as snapshot events, so core's copy starts complete; from here on each change sends its
 * own. Safe to run again (core keeps the newest). On a new database it finds nothing, and the
 * rbac step after it sends the roles.
 */
export const accessSnapshotsMigration: Migration = {
  id: '20261114-001-access-snapshots',
  description: 'The first copy for core: every role, account and its grants as a snapshot event',
  async up({ mongo, logger }) {
    const roles = await writeAllRoleSnapshots(mongo);
    let accounts = 0;
    let batch: User[] = [];
    const flush = async () => {
      const part = batch;
      batch = [];
      if (part.length === 0) return;
      const now = new Date();
      await withTransaction(mongo, async (session) => {
        for (const user of part) {
          await writeUserSnapshot(mongo, session, user);
          await writeAccessSnapshot(mongo, session, user._id, user.authzVersion ?? 0, now);
        }
      });
      accounts += part.length;
    };
    for await (const user of mongo.db
      .collection<User>(USERS)
      .find({}, { comment: 'full read: every account, once per database' })) {
      batch.push(user);
      if (batch.length === SNAPSHOT_BATCH) await flush();
    }
    await flush();
    logger.info({ roles, accounts }, 'snapshots for the first copy');
  },
};
