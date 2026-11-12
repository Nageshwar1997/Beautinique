import { withTransaction } from '@beautinique/backend-server-mongo';
import type { Migration } from '@beautinique/backend-server-release';
import type { AppId } from '@beautinique/shared-contracts';

import { LEGAL_ACCEPTANCES, type LegalAcceptance, type User, USERS } from '../users.ts';
import { type RbacCatalog, rbacCatalog } from './catalog.ts';
import { giveSystemGrant } from './grants.ts';
import { SIGN_UP_ROLES } from './roles.ts';

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
