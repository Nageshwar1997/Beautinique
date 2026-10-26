import type { Logger } from '@beautinique/backend-server-kit';
import type { Mongo } from '@beautinique/backend-server-mongo';

import { MigrationFailedError } from './errors';

/** Which migrations ran, one record each (the deployable's own database). */
export const MIGRATIONS = 'platform_migrations';

/** What a migration and a release step get. */
export interface ReleaseContext {
  mongo: Mongo;
  logger: Logger;
}

/**
 * One change to the database (RULES §1.14): forward only, safe to run again, and expand/contract,
 * because the running release keeps working on the same data while the new one starts. Its id never
 * changes once it ran anywhere. Long backfills do not belong here (every boot step has 60 s): run
 * them as a queue task.
 */
export interface Migration {
  /** `YYYYMMDD-NNN-words`, e.g. `20261027-001-users-email-unique`; ids sort in the order they run. */
  id: string;
  description: string;
  up(context: ReleaseContext): Promise<void>;
}

interface MigrationRecord {
  _id: string;
  description: string;
  appliedAt: Date;
  ms: number;
}

const ID = /^\d{8}-\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Checks a deployable's migrations: well-formed ids, each after the one before it (so unique), and a
 * description. A bad list throws when the module loads, long before a deploy.
 */
export function defineMigrations(list: readonly Migration[]): readonly Migration[] {
  let previous = '';
  for (const migration of list) {
    if (!ID.test(migration.id)) {
      throw new Error(
        `Migration id "${migration.id}" must look like 20261027-001-users-email-unique: the date, ` +
          'a three-digit number, then lowercase words joined by hyphens.',
      );
    }
    if (migration.id <= previous) {
      throw new Error(
        `Migration ${migration.id} must come after ${previous}: ids are unique and listed in order.`,
      );
    }
    if (migration.description.trim() === '') {
      throw new Error(`Migration ${migration.id} needs a description.`);
    }
    previous = migration.id;
  }
  return Object.freeze([...list]);
}

/**
 * Runs the migrations the database has not seen, in order, and records each one after it ran.
 * `beforeEach` runs before every migration (the release checks that it still holds its lease). Ids
 * the database has but this code does not know (a newer release ran first) are only reported.
 */
export async function runMigrations(
  context: ReleaseContext,
  migrations: readonly Migration[],
  beforeEach: () => void,
): Promise<{ applied: string[]; unknown: string[] }> {
  const { mongo, logger } = context;
  const records = mongo.db.collection<MigrationRecord>(MIGRATIONS);
  const done = new Set(
    (await records.find({}, { projection: { _id: 1 } }).toArray()).map((record) => record._id),
  );
  const known = new Set(migrations.map((migration) => migration.id));
  const unknown = [...done].filter((id) => !known.has(id)).toSorted();
  if (unknown.length > 0) {
    logger.warn({ unknown }, 'the database has migrations this code does not know');
  }

  const applied: string[] = [];
  for (const migration of migrations) {
    if (done.has(migration.id)) continue;
    beforeEach();
    const started = performance.now();
    try {
      await migration.up(context);
    } catch (error) {
      throw new MigrationFailedError(migration.id, { cause: error });
    }
    const ms = Math.round(performance.now() - started);
    await records.updateOne(
      { _id: migration.id },
      { $setOnInsert: { description: migration.description, appliedAt: new Date(), ms } },
      { upsert: true },
    );
    logger.info({ migration: migration.id, ms }, 'migration applied');
    applied.push(migration.id);
  }
  return { applied, unknown };
}
