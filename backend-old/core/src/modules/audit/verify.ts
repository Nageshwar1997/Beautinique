import type { Logger } from '@beautinique/backend-server-kit';
import { ObjectId } from '@beautinique/backend-server-mongo';
import { defineTask, type Schedule, type Task } from '@beautinique/backend-server-queue';

import { type AuditStore, type ChainCheck, chainStartOf, dayOf, hashOf } from './store.ts';

/**
 * The daily check of the audit chains (owner, 2026-11-15; TASKS T4.1 PR C): each finished day is
 * counted again and its hashes followed from the day's start; a broken chain is an error in the
 * logs (Sentry), and the Master app's viewer shows each day as checked or broken.
 */
export const VERIFY_TASK = 'audit.verifyChains';

/** The days a run looks back over: a day missed while the free server slept is checked later. */
export const VERIFY_LOOKBACK_DAYS = 7;

/** Once a day, after midnight UTC; a sleeping free server may run it late, so 2 days of slack. */
export const VERIFY_SCHEDULE: Schedule = {
  task: VERIFY_TASK,
  pattern: '15 0 * * *',
  tz: 'UTC',
  maxGapMs: 2 * 24 * 60 * 60_000,
};

export interface DayCheck {
  ok: boolean;
  entries: number;
  brokenAtSeq: number | null;
}

/**
 * Follows one day's chain: every entry in order from 1, each pointing at the hash before it and
 * carrying its own true hash, and as many as the day's head counts, ending in its last hash.
 */
export async function verifyDay(store: AuditStore, day: string): Promise<DayCheck> {
  const head = await store.heads.findOne({ day });
  let expectedSeq = 1;
  let prevHash = chainStartOf(day);
  let brokenAtSeq: number | null = null;
  for await (const entry of store.entries.find({ day }).sort({ seq: 1 })) {
    if (
      brokenAtSeq === null &&
      (entry.seq !== expectedSeq || entry.prevHash !== prevHash || hashOf(entry) !== entry.hash)
    ) {
      brokenAtSeq = expectedSeq;
    }
    expectedSeq += 1;
    prevHash = entry.hash;
  }
  const entries = expectedSeq - 1;
  const length = head?.seq ?? 0;
  // fewer or more entries than the head counts (or no head at all): the first place that differs;
  // the same count with another last hash: the last entry
  if (brokenAtSeq === null && entries !== length) brokenAtSeq = Math.min(entries, length) + 1;
  if (brokenAtSeq === null && length > 0 && head?.lastHash !== prevHash) brokenAtSeq = length;
  return { ok: brokenAtSeq === null, entries, brokenAtSeq };
}

/**
 * Checks every finished day of the last week again (today's chain is still growing): a change
 * made after a day's first check shows up the next morning too, for a week.
 */
export async function verifyChains(
  store: AuditStore,
  logger: Logger,
  now: Date = new Date(),
): Promise<Omit<ChainCheck, '_id'>[]> {
  const today = dayOf(now);
  const since = dayOf(new Date(now.getTime() - VERIFY_LOOKBACK_DAYS * 24 * 60 * 60_000));
  const done: Omit<ChainCheck, '_id'>[] = [];
  // the days of the entries themselves, and of the heads: a head lost (it sits in core's database,
  // the entries in the insert-only one) still leaves its day checked, and broken
  const range = { day: { $gte: since, $lt: today } };
  const days = new Set([
    ...(await store.entries.distinct('day', range)),
    ...(await store.heads.distinct('day', range)),
  ]);
  for (const day of [...days].sort()) {
    const head = { day };
    const result = await verifyDay(store, head.day);
    const checkedAt = new Date();
    await store.checks.updateOne(
      { day: head.day },
      { $set: { ...result, checkedAt }, $setOnInsert: { _id: new ObjectId() } },
      { upsert: true },
    );
    const check = { day: head.day, ...result, checkedAt };
    if (!result.ok) {
      logger.error(
        { day: head.day, entries: result.entries, brokenAtSeq: result.brokenAtSeq },
        'audit chain broken',
      );
    }
    done.push(check);
  }
  logger.info(
    { days: done.length, broken: done.filter((check) => !check.ok).length },
    'audit chains checked',
  );
  return done;
}

export function verifyTask(store: AuditStore, logger: Logger): Task {
  return defineTask(VERIFY_TASK, async ({ firedAt }) => {
    await verifyChains(store, logger, firedAt);
  });
}
