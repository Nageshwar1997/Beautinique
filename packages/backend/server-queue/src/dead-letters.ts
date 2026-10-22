import type { Logger } from '@beautinique/backend-server-kit';
import type { Mongo } from '@beautinique/backend-server-mongo';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

import { DEAD_LETTERS, type DeadLetter } from './consumer';
import { openQueue, RELAY_JOB_OPTIONS } from './relay';

export interface RedriveDeadLettersOptions {
  /** The consumer deployable's own database, where its dead letters are. */
  mongo: Mongo;
  redis: Redis;
  logger: Logger;
  /** Which dead letters (their ids, `<eventId>@<subscriber>`); all when left out. */
  ids?: readonly string[];
  /** BullMQ key prefix (default `bull`). */
  prefix?: string;
}

export interface RedriveResult {
  /** Sent to their queue again (and removed from the dead letters). */
  sent: string[];
  /** Left alone: their job is still running or waiting in Redis. */
  skipped: string[];
}

/**
 * Sends dead letters to their queue again, once a person has fixed the cause (a handler bug, a
 * partner outage): same job id, fresh retries. The old failed job is removed from Redis first,
 * because BullMQ ignores a new job whose id still exists. A dead letter leaves the collection only
 * after its job is queued; if it fails again it comes back as a new dead letter.
 */
export async function redriveDeadLetters({
  mongo,
  redis,
  logger,
  ids,
  prefix = 'bull',
}: RedriveDeadLettersOptions): Promise<RedriveResult> {
  const deadLetters = mongo.db.collection<DeadLetter>(DEAD_LETTERS);
  const letters = await deadLetters
    .find(ids === undefined ? {} : { _id: { $in: [...ids] } })
    .sort({ failedAt: 1 })
    .toArray();
  const queues = new Map<string, Queue>();
  const result: RedriveResult = { sent: [], skipped: [] };
  try {
    for (const letter of letters) {
      let queue = queues.get(letter.queue);
      if (!queue) {
        queue = openQueue(letter.queue, redis, prefix, (error) => {
          logger.warn({ err: { name: error.name, message: error.message } }, 'redrive queue error');
        });
        queues.set(letter.queue, queue);
      }
      await queue.remove(letter._id);
      if (await queue.getJob(letter._id)) {
        result.skipped.push(letter._id);
        continue;
      }
      await queue.add(letter.subscriber, letter.envelope, {
        ...RELAY_JOB_OPTIONS,
        jobId: letter._id,
      });
      await deadLetters.deleteOne({ _id: letter._id });
      result.sent.push(letter._id);
    }
  } finally {
    await Promise.all([...queues.values()].map((open) => open.close()));
  }
  logger.info({ sent: result.sent.length, skipped: result.skipped }, 'dead letters redriven');
  return result;
}
