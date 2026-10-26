import { createHash, randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

import type { Logger } from '@beautinique/backend-server-kit';
import {
  type IndexSpec,
  type IndexSyncReport,
  type Mongo,
  syncIndexes,
} from '@beautinique/backend-server-mongo';
import { releaseLease, tryLease } from '@beautinique/backend-server-queue';

import { ReleaseLeaseLostError, ReleaseLockTimeoutError } from './errors';
import { defineMigrations, type Migration, type ReleaseContext, runMigrations } from './migrations';

/** The lease (in platform_locks) that one booting instance holds while its release steps run. */
export const RELEASE_LEASE = 'release';

/** One document: the fingerprint of the release the database last finished. */
export const RELEASE_STATE = 'platform_release';
const STATE_ID = 'current';

// bump it when runRelease starts doing something new, so every database runs its steps once more
const RUNNER_VERSION = 1;

/** A step after migrations and indexes, e.g. the permission sync of identity (TASKS T3.3). */
export interface ReleaseStep {
  /** For the log. */
  name: string;
  /** Changes when the step has new work (e.g. a hash of what it syncs): a new value runs it again. */
  fingerprint: string;
  /** Safe to run again, like a migration. */
  run(context: ReleaseContext): Promise<void>;
}

/** What a deployable has to bring its database up to date: the same list on every boot. */
export interface ReleaseDefinition {
  migrations: readonly Migration[];
  indexes: readonly IndexSpec[];
  steps?: readonly ReleaseStep[];
}

export interface RunReleaseOptions extends ReleaseDefinition {
  mongo: Mongo;
  logger: Logger;
  /** Run even when the database already has this release (e.g. an index was dropped by hand). */
  force?: boolean;
  /** How long the lease lasts unless renewed (default 30 s); it is renewed every third of that. */
  lockTtlMs?: number;
  /** How long to wait for another instance's lease (default 60 s). */
  waitMs?: number;
  /** How often to look whether that lease is free (default 1 s). */
  pollMs?: number;
  /** All boot steps should finish within this (default 60 s, ARCHITECTURE §11.1); longer is a warning. */
  budgetMs?: number;
}

export interface ReleaseReport {
  /** True when the database already had this release, so nothing ran. */
  upToDate: boolean;
  fingerprint: string;
  /** Migrations this boot ran. */
  migrations: string[];
  /** Migrations the database has but this code does not know (a newer release ran first). */
  unknownMigrations: string[];
  indexes: IndexSyncReport;
  /** Steps this boot ran. */
  steps: string[];
  ms: number;
}

interface ReleaseState {
  _id: string;
  fingerprint: string;
  releasedAt: Date;
  ms: number;
}

/**
 * One value for everything a release would do: the migration ids, every index's shape and every
 * step's fingerprint. Equal values mean the database already has this release.
 */
export function releaseFingerprint({ migrations, indexes, steps = [] }: ReleaseDefinition): string {
  const shape = {
    runner: RUNNER_VERSION,
    migrations: migrations.map((migration) => migration.id),
    indexes: indexes.map((index) => [
      index.collection,
      index.name,
      Object.entries(index.key),
      index.unique ?? false,
      index.sparse ?? false,
      index.expireAfterSeconds ?? null,
      index.partialFilterExpression ?? null,
    ]),
    steps: steps.map((step) => [step.name, step.fingerprint]),
  };
  return createHash('sha256').update(JSON.stringify(shape)).digest('hex');
}

interface HeldLease {
  /** Throws ReleaseLeaseLostError when the lease may no longer be ours. */
  check(): void;
  /** Stops renewing and gives the lease up. */
  release(): Promise<void>;
}

/** Takes the release lease (waiting up to waitMs for another holder) and keeps renewing it. */
async function takeLease(
  mongo: Mongo,
  logger: Logger,
  { lockTtlMs, waitMs, pollMs }: { lockTtlMs: number; waitMs: number; pollMs: number },
): Promise<HeldLease> {
  const owner = randomUUID();
  const deadline = Date.now() + waitMs;
  let asked = Date.now();
  let told = false;
  while (!(await tryLease(mongo, RELEASE_LEASE, owner, lockTtlMs))) {
    if (Date.now() >= deadline) throw new ReleaseLockTimeoutError(waitMs);
    if (!told) {
      logger.info('waiting for another instance to finish its release steps');
      told = true;
    }
    await sleep(pollMs);
    asked = Date.now();
  }

  // ours until this time at the latest, counted from before the request (MongoDB's clock decides)
  let heldUntil = asked + lockTtlMs;
  let lost = false;
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;
  let renewing: Promise<void> | undefined;
  const renew = async (): Promise<void> => {
    const started = Date.now();
    // a lease that ran out is never taken back: another instance may have run in between
    if (started >= heldUntil) {
      lost = true;
      return;
    }
    try {
      if (await tryLease(mongo, RELEASE_LEASE, owner, lockTtlMs)) heldUntil = started + lockTtlMs;
      else lost = true;
    } catch (error) {
      logger.warn({ err: error }, 'could not renew the release lease');
    }
  };
  const schedule = (): void => {
    timer = setTimeout(
      () => {
        renewing = renew().finally(() => {
          renewing = undefined;
          if (!stopped) schedule();
        });
      },
      Math.max(250, Math.floor(lockTtlMs / 3)),
    );
    // the lease alone never keeps the process alive
    timer.unref();
  };
  schedule();

  return {
    check() {
      if (lost || Date.now() >= heldUntil) throw new ReleaseLeaseLostError();
    },
    async release() {
      stopped = true;
      clearTimeout(timer);
      await renewing;
      await releaseLease(mongo, RELEASE_LEASE, owner).catch(() => undefined);
    },
  };
}

/**
 * The release steps of one deployable, before it listens (ARCHITECTURE §11.1; free Render has no
 * pre-deploy command): migrations, then the index sync, then the extra steps, under a MongoDB lease
 * so one instance runs them at a time. When the database already has this release (the fingerprint
 * matches), a boot only reads one document: the hourly cold start stays fast. Any failure stops the
 * boot, and Render keeps the running release.
 */
export async function runRelease(options: RunReleaseOptions): Promise<ReleaseReport> {
  const {
    mongo,
    logger,
    indexes,
    steps = [],
    force = false,
    lockTtlMs = 30_000,
    waitMs = 60_000,
    pollMs = 1000,
    budgetMs = 60_000,
  } = options;
  const migrations = defineMigrations(options.migrations);
  const started = performance.now();
  const elapsed = () => Math.round(performance.now() - started);
  const fingerprint = releaseFingerprint({ migrations, indexes, steps });
  const state = mongo.db.collection<ReleaseState>(RELEASE_STATE);
  const isCurrent = async () =>
    (await state.findOne({ _id: STATE_ID }))?.fingerprint === fingerprint;
  const nothing = (): ReleaseReport => ({
    upToDate: true,
    fingerprint,
    migrations: [],
    unknownMigrations: [],
    indexes: { created: [], extra: [] },
    steps: [],
    ms: elapsed(),
  });

  if (!force && (await isCurrent())) {
    logger.debug({ fingerprint }, 'release steps up to date');
    return nothing();
  }

  const lease = await takeLease(mongo, logger, { lockTtlMs, waitMs, pollMs });
  try {
    // another instance may have finished this release while we waited for the lease
    if (!force && (await isCurrent())) {
      logger.debug({ fingerprint }, 'release steps up to date');
      return nothing();
    }
    const context: ReleaseContext = { mongo, logger };
    const ran = await runMigrations(context, migrations, () => {
      lease.check();
    });
    lease.check();
    const synced = await syncIndexes(mongo, indexes);
    const done: string[] = [];
    for (const step of steps) {
      lease.check();
      await step.run(context);
      done.push(step.name);
    }
    lease.check();
    const ms = elapsed();
    await state.updateOne(
      { _id: STATE_ID },
      { $set: { fingerprint, releasedAt: new Date(), ms } },
      { upsert: true },
    );

    const report: ReleaseReport = {
      upToDate: false,
      fingerprint,
      migrations: ran.applied,
      unknownMigrations: ran.unknown,
      indexes: synced,
      steps: done,
      ms,
    };
    logger.info(
      {
        ms,
        migrations: report.migrations,
        indexesCreated: synced.created,
        steps: done,
        fingerprint,
      },
      'release steps done',
    );
    if (synced.extra.length > 0) {
      logger.warn(
        { indexes: synced.extra },
        'indexes nobody asks for: drop them with a migration once no running code needs them',
      );
    }
    if (ms > budgetMs) {
      logger.warn({ ms, budgetMs }, 'release steps took longer than the boot budget');
    }
    return report;
  } finally {
    await lease.release();
  }
}
