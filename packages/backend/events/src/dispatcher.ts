import { acquireLease, QUERY_MAX_TIME_MS, releaseLease } from '@beautinique/backend-mongo';
import type { Clock } from '@beautinique/shared-clock';
import type { Db, ObjectId } from 'mongodb';

import type { DeliveryTransport } from './delivery.ts';
import type { DeliveryStatus, EventsLogger } from './inbox.ts';
import {
  deliveryStage,
  OUTBOX_COLLECTION,
  summaryStages,
  type Delivery,
  type OutboxRecord,
  type Subscriptions,
} from './outbox.ts';
import { MAX_ATTEMPTS, retryDelay, UNAVAILABLE_RETRY_MS } from './retry.ts';
import { startLoop, type Loop } from './utils/loop.ts';

/** The lease that one instance holds to dispatch a service's outbox (§4 rule 4). */
export const DISPATCHER_LEASE = 'dispatcher';

/** How long the lease is held from each renewal. */
export const DISPATCHER_LEASE_MS = 30_000;

/** The fallback poll when no nudge comes (docs/ARCHITECTURE.md §3 rule 3). */
export const DISPATCH_POLL_MS = 5_000;

/** How many due events one pass takes. */
export const DISPATCH_BATCH_SIZE = 100;

/** A delivery held up by a dead one is looked at again this often, until that one is dealt with. */
export const BLOCKED_RECHECK_MS = 60 * 60_000;

export interface PassResult {
  /** Whether this instance held the lease; without it the pass did nothing. */
  held: boolean;
  delivered: number;
  failed: number;
  dead: number;
  unavailable: number;
  /** Deliveries that wait for an earlier event of their aggregate (§3 rule 5). */
  heldUp: number;
}

export interface Dispatcher {
  /** One pass over the due events. The loop runs it; a test may call it. */
  pass(): Promise<PassResult>;
  /** Runs a pass soon: after a commit that wrote events (§3 rule 3). */
  nudge(): void;
  /** Starts the loop: a pass at once, then on each nudge and every `pollMs`. */
  start(): void;
  /** Stops the loop, waits for its pass and gives the lease up. */
  stop(): Promise<void>;
}

export interface DispatcherOptions {
  db: Db;
  clock: Clock;
  /** This instance: one process, never shared. */
  owner: string;
  /** The producer's subscriptions, so that boot fails when one has no way to its subscriber. */
  subscriptions: Subscriptions;
  transport: DeliveryTransport;
  logger: EventsLogger;
  pollMs?: number;
  batchSize?: number;
}

type DueEvent = Pick<
  OutboxRecord,
  '_id' | 'aggregateKey' | 'aggregateVersion' | 'payload' | 'deliveries'
>;

interface Head {
  eventId: ObjectId;
  status: Delivery['status'];
  nextAttemptAt: Date | null;
}

interface Group {
  aggregateKey: string;
  subscriber: string;
  events: DueEvent[];
}

const groupKey = (aggregateKey: string, subscriber: string): string =>
  `${aggregateKey}\u0000${subscriber}`;

// One aggregate's order: its version, then the id (the order of the writes in one transaction).
const byOrder = (a: DueEvent, b: DueEvent): number =>
  a.aggregateVersion - b.aggregateVersion || a._id.toHexString().localeCompare(b._id.toHexString());

/**
 * The dispatcher of a producer's outbox (docs/ARCHITECTURE.md §3 rules 2 to 6, §10.2 rules 10 and
 * 11): behind the `dispatcher` lease, it takes the events with a due pending delivery and gives
 * each to its subscriber, the events of one aggregate in order. A subscriber that fails holds up
 * only its own later events of that aggregate; others go on. A failure is tried again after a
 * longer wait each time, up to `MAX_ATTEMPTS`, and then the delivery is dead (the subscriber has
 * written its dead letter). A subscriber that is down is tried again without counting.
 */
export function createDispatcher(options: DispatcherOptions): Dispatcher {
  const { db, clock, owner, transport, logger } = options;
  const batchSize = options.batchSize ?? DISPATCH_BATCH_SIZE;
  for (const [type, subscribers] of Object.entries(options.subscriptions)) {
    for (const subscriber of subscribers) {
      if (!transport.subscribers.has(subscriber)) {
        throw new RangeError(`The subscriber ${subscriber} of ${type} has no way in (transport).`);
      }
    }
  }
  const outbox = db.collection<OutboxRecord>(OUTBOX_COLLECTION);
  const lease = (now: Date) =>
    acquireLease(db, { name: DISPATCHER_LEASE, owner, now, ttlMs: DISPATCHER_LEASE_MS });

  // The first event of each aggregate that each subscriber has not had: only that one may go.
  async function headsOf(keys: string[], subscribers: string[]): Promise<Map<string, Head>> {
    const rows = await outbox
      .aggregate<{ _id: { key: string; subscriber: string } } & Head>(
        [
          { $match: { aggregateKey: { $in: keys }, doneAt: null } },
          { $sort: { aggregateKey: 1, aggregateVersion: 1, _id: 1 } },
          { $unwind: '$deliveries' },
          {
            $match: {
              'deliveries.subscriber': { $in: subscribers },
              'deliveries.status': { $ne: 'delivered' },
            },
          },
          {
            $group: {
              _id: { key: '$aggregateKey', subscriber: '$deliveries.subscriber' },
              eventId: { $first: '$_id' },
              status: { $first: '$deliveries.status' },
              nextAttemptAt: { $first: '$deliveries.nextAttemptAt' },
            },
          },
        ],
        { maxTimeMS: QUERY_MAX_TIME_MS },
      )
      .toArray();
    return new Map(rows.map((row) => [groupKey(row._id.key, row._id.subscriber), row]));
  }

  // One try of one delivery, and what it says written to the outbox: the status, and when the
  // delivery is next due (`null` when it is not pending any more).
  async function deliverOne(
    event: DueEvent,
    delivery: Delivery,
  ): Promise<{ status: DeliveryStatus; next: Date | null }> {
    const attempt = delivery.attempts + 1;
    let status: DeliveryStatus;
    try {
      status = await transport.deliver({
        subscriber: delivery.subscriber,
        payload: event.payload,
        attempt,
        maxAttempts: MAX_ATTEMPTS,
      });
    } catch (thrown) {
      logger.error({ err: thrown, subscriber: delivery.subscriber }, 'A delivery threw.');
      status = 'unavailable';
    }
    const now = clock.now();
    let changes: Partial<Delivery>;
    if (status === 'delivered') {
      changes = {
        status: 'delivered',
        attempts: attempt,
        nextAttemptAt: null,
        deliveredAt: now,
        lastError: null,
      };
    } else if (status === 'unavailable') {
      changes = { nextAttemptAt: new Date(now.getTime() + UNAVAILABLE_RETRY_MS) };
    } else if (status === 'dead' || attempt >= MAX_ATTEMPTS) {
      status = 'dead';
      changes = {
        status: 'dead',
        attempts: attempt,
        nextAttemptAt: null,
        lastError: 'Dead after its last try.',
      };
      logger.warn(
        { eventId: event._id.toHexString(), subscriber: delivery.subscriber, attempts: attempt },
        'A delivery is dead.',
      );
    } else {
      changes = {
        attempts: attempt,
        nextAttemptAt: new Date(now.getTime() + retryDelay(attempt)),
        lastError: 'The subscriber failed.',
      };
    }
    // Only if no one else wrote this try first (another instance, in a lease's handover).
    await outbox.updateOne(
      {
        _id: event._id,
        deliveries: {
          $elemMatch: {
            subscriber: delivery.subscriber,
            status: 'pending',
            attempts: delivery.attempts,
          },
        },
      },
      [deliveryStage(delivery.subscriber, changes), ...summaryStages(now)],
      { maxTimeMS: QUERY_MAX_TIME_MS },
    );
    return { status, next: changes.nextAttemptAt ?? null };
  }

  // Moves due deliveries that wait for an earlier event out of the due window, to `until`.
  async function holdUp(events: DueEvent[], subscriber: string, until: Date): Promise<void> {
    const now = clock.now();
    await outbox.updateMany(
      { _id: { $in: events.map((event) => event._id) } },
      [
        deliveryStage(subscriber, { nextAttemptAt: until }, [
          { $eq: ['$$d.status', 'pending'] },
          { $lte: ['$$d.nextAttemptAt', { $literal: now }] },
        ]),
        ...summaryStages(now),
      ],
      { maxTimeMS: QUERY_MAX_TIME_MS },
    );
  }

  // When the events that wait for `head` are next looked at.
  function waitFor(head: Head): Date {
    const now = clock.now().getTime();
    if (head.status === 'dead' || head.nextAttemptAt === null) {
      return new Date(now + BLOCKED_RECHECK_MS);
    }
    return new Date(Math.max(head.nextAttemptAt.getTime(), now + DISPATCH_POLL_MS));
  }

  async function pass(): Promise<PassResult> {
    const result: PassResult = {
      held: false,
      delivered: 0,
      failed: 0,
      dead: 0,
      unavailable: 0,
      heldUp: 0,
    };
    const start = clock.now();
    if (!(await lease(start))) return result;
    result.held = true;
    let renewedAt = start.getTime();
    // A long pass keeps its lease; one that lost it stops, and the other instance goes on.
    const keepLease = async (): Promise<boolean> => {
      const now = clock.now();
      if (now.getTime() - renewedAt <= DISPATCHER_LEASE_MS / 3) return true;
      renewedAt = now.getTime();
      return lease(now);
    };

    const due = await outbox
      .find(
        { pendingCount: { $gt: 0 }, nextAttemptAt: { $lte: start } },
        {
          projection: { aggregateKey: 1, aggregateVersion: 1, payload: 1, deliveries: 1 },
          sort: { nextAttemptAt: 1, _id: 1 },
          limit: batchSize,
          maxTimeMS: QUERY_MAX_TIME_MS,
        },
      )
      .toArray();
    if (due.length === 0) return result;

    // The due deliveries of each aggregate and subscriber; the soonest group first.
    const groups = new Map<string, Group>();
    for (const event of due) {
      for (const delivery of event.deliveries) {
        if (delivery.status !== 'pending' || delivery.nextAttemptAt === null) continue;
        if (delivery.nextAttemptAt.getTime() > start.getTime()) continue;
        const key = groupKey(event.aggregateKey, delivery.subscriber);
        let group = groups.get(key);
        if (group === undefined) {
          group = { aggregateKey: event.aggregateKey, subscriber: delivery.subscriber, events: [] };
          groups.set(key, group);
        }
        group.events.push(event);
      }
    }
    const heads = await headsOf(
      [...new Set(due.map((event) => event.aggregateKey))],
      [...new Set([...groups.values()].map((group) => group.subscriber))],
    );

    for (const [key, group] of groups) {
      group.events.sort(byOrder);
      let head = heads.get(key);
      for (const [index, event] of group.events.entries()) {
        if (!(await keepLease())) return result;
        if (head !== undefined && !head.eventId.equals(event._id)) {
          // An earlier event of this aggregate has not gone to this subscriber yet.
          const rest = group.events.slice(index);
          await holdUp(rest, group.subscriber, waitFor(head));
          result.heldUp += rest.length;
          break;
        }
        const delivery = event.deliveries.find(
          (candidate) => candidate.subscriber === group.subscriber,
        ) as Delivery;
        const { status, next } = await deliverOne(event, delivery);
        result[status] += 1;
        if (status !== 'delivered') {
          const later = group.events.slice(index + 1);
          if (later.length > 0) {
            await holdUp(
              later,
              group.subscriber,
              waitFor({
                eventId: event._id,
                status: next === null ? 'dead' : 'pending',
                nextAttemptAt: next,
              }),
            );
            result.heldUp += later.length;
          }
          break;
        }
        if (index + 1 < group.events.length) {
          head = (await headsOf([group.aggregateKey], [group.subscriber])).get(key);
        }
      }
    }
    return result;
  }

  let loop: Loop | undefined;
  return {
    pass,
    nudge() {
      loop?.nudge();
    },
    start() {
      if (loop !== undefined) return;
      loop = startLoop({
        run: pass,
        everyMs: options.pollMs ?? DISPATCH_POLL_MS,
        firstInMs: 0,
        onError: (thrown) => {
          logger.error({ err: thrown }, 'A pass of the dispatcher failed.');
        },
      });
    },
    async stop() {
      if (loop === undefined) return;
      const stopping = loop;
      loop = undefined;
      await stopping.stop();
      await releaseLease(db, { name: DISPATCHER_LEASE, owner }).catch(() => undefined);
    },
  };
}
