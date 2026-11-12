import type { Logger } from '@beautinique/backend-server-kit';
import type { Mongo } from '@beautinique/backend-server-mongo';

/**
 * Collections that a release of before ObjectIds (owner, 2026-11-12) keyed by a name in `_id`:
 * its release state, migrations, leases, task runs and facts, and identity's and notify's
 * catalogues. A running release of before writes some of them every minute, so they show such a
 * database even after its data was deleted by hand.
 */
export const BEFORE_OBJECTIDS = [
  'platform_release',
  'platform_migrations',
  'platform_locks',
  'platform_task_runs',
  'platform_state',
  'identity_apps',
  'identity_permissions',
  'identity_roles',
  'identity_signing_keys',
  'notify_email_days',
] as const;

/**
 * A database from before ObjectIds goes whole: every collection, its indexes too, so the release
 * starts it anew. Its data was test data only (owner, 2026-11-12), and this code cannot read it:
 * names where ids are now, ids as text, unique indexes on fields it no longer writes. A database
 * of today (every `_id` an ObjectId, RULES §4.17) is left alone. True when it dropped one.
 */
export async function dropIfBeforeObjectIds(mongo: Mongo, logger: Logger): Promise<boolean> {
  let before = false;
  for (const name of BEFORE_OBJECTIDS) {
    const found = await mongo.db
      .collection(name)
      .findOne({ _id: { $type: 'string' } } as never, { projection: { _id: 1 } });
    if (found) {
      before = true;
      break;
    }
  }
  if (!before) return false;
  const collections = await mongo.db.listCollections({}, { nameOnly: true }).toArray();
  const dropped = collections.map(({ name }) => name).filter((name) => !name.startsWith('system.'));
  for (const name of dropped) await mongo.db.collection(name).drop();
  logger.warn(
    { database: mongo.db.databaseName, collections: dropped.length },
    'a database from before ObjectIds: dropped',
  );
  return true;
}
