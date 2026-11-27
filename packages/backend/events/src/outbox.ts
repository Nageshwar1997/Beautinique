import { defineCollection, QUERY_MAX_TIME_MS } from '@beautinique/backend-mongo';
import type { Clock } from '@beautinique/shared-clock';
import {
  EVENT_MAX_BYTES,
  SERVICES,
  type EventContract,
  type Service,
} from '@beautinique/shared-contracts';
import { ObjectId, type ClientSession, type Db, type Document } from 'mongodb';
import type { input, output, ZodRawShape } from 'zod';

import { subscriberService } from './subscriber.ts';

/** The platform collection of a producer's events and their deliveries (docs/ARCHITECTURE.md §3 rule 2). */
export const OUTBOX_COLLECTION = 'outbox';

/** An event whose every delivery is done goes this long after (§10.2: 7 days). */
export const OUTBOX_DONE_TTL_SECONDS = 7 * 24 * 60 * 60;

export type DeliveryState = 'pending' | 'delivered' | 'dead';

/** How one subscriber's delivery of an event stands; it lives in the event's outbox record. */
export interface Delivery {
  subscriber: string;
  status: DeliveryState;
  /** The tries made so far. A try that found the subscriber down is not one (§10.2 rule 11). */
  attempts: number;
  /** When the next try is due; `null` once it is not pending. */
  nextAttemptAt: Date | null;
  deliveredAt: Date | null;
  /** What the last failed try said, short and without values (`TypeError: ...`). */
  lastError: string | null;
}

export interface OutboxRecord {
  /** The event's id: its `eventId` is this as 24 hex. */
  _id: ObjectId;
  type: string;
  producer: Service;
  /** `<aggregate type>:<aggregate id>`: a subscriber gets the events of one key in order (§3 rule 5). */
  aggregateKey: string;
  aggregateVersion: number;
  occurredAt: Date;
  /** The envelope as JSON text, as it was checked; what each subscriber gets, byte for byte. */
  payload: string;
  deliveries: Delivery[];
  /** How many deliveries are pending: the dispatcher takes only an event with one (§10.2 rule 10). */
  pendingCount: number;
  /** The soonest `nextAttemptAt` of the pending deliveries; `null` when there is none. */
  nextAttemptAt: Date | null;
  /** When every delivery was delivered; the TTL index removes the event 7 days after. */
  doneAt: Date | null;
}

const DELIVERY_SCHEMA = {
  bsonType: 'object',
  required: ['subscriber', 'status', 'attempts', 'nextAttemptAt'],
  properties: {
    subscriber: { bsonType: 'string' },
    status: { enum: ['pending', 'delivered', 'dead'] },
    attempts: { bsonType: 'int', minimum: 0 },
    nextAttemptAt: { bsonType: ['date', 'null'] },
  },
};

/** The outbox, for a service's `defineCollections`. */
export const outboxCollection = defineCollection({
  name: OUTBOX_COLLECTION,
  retention: 'tech',
  schema: {
    bsonType: 'object',
    required: [
      '_id',
      'type',
      'producer',
      'aggregateKey',
      'aggregateVersion',
      'occurredAt',
      'payload',
      'deliveries',
      'pendingCount',
    ],
    properties: {
      _id: { bsonType: 'objectId' },
      type: { bsonType: 'string' },
      producer: { enum: [...SERVICES] },
      aggregateKey: { bsonType: 'string' },
      aggregateVersion: { bsonType: 'int', minimum: 0 },
      occurredAt: { bsonType: 'date' },
      payload: { bsonType: 'string', maxLength: EVENT_MAX_BYTES },
      deliveries: { bsonType: 'array', items: DELIVERY_SCHEMA },
      pendingCount: { bsonType: 'int', minimum: 0 },
      nextAttemptAt: { bsonType: ['date', 'null'] },
      doneAt: { bsonType: ['date', 'null'] },
    },
  },
  indexes: [
    // What the dispatcher takes: the events with a pending delivery that is due, soonest first.
    {
      name: 'nextAttemptAt_id_pending',
      key: { nextAttemptAt: 1, _id: 1 },
      partialFilterExpression: { pendingCount: { $gt: 0 } },
    },
    // The order of one aggregate's events, to find the first one a subscriber has not had.
    {
      name: 'aggregateKey_aggregateVersion_id',
      key: { aggregateKey: 1, aggregateVersion: 1, _id: 1 },
    },
    { name: 'doneAt_ttl', key: { doneAt: 1 }, expireAfterSeconds: OUTBOX_DONE_TTL_SECONDS },
  ],
  expiry: { ttlIndex: 'doneAt_ttl' },
  accountDelete: {
    none: 'An event holds ids and the state that is needed, never personal data (docs/ARCHITECTURE.md §3 rule 8); it goes 7 days after it is delivered.',
  },
});

/** Each event type of the producer, and the subscribers that take it. */
export type Subscriptions = Readonly<Record<string, readonly string[]>>;

// Any event contract: what `append` needs of one.
type AnyEventContract = EventContract<string, number, ZodRawShape>;

/** What the producer gives for an event; the rest of the envelope the outbox fills in. */
export type EventInput<C extends AnyEventContract> = Omit<
  input<C['schema']>,
  'eventId' | 'type' | 'version' | 'occurredAt' | 'producer'
>;

export type EventEnvelope<C extends AnyEventContract> = output<C['schema']>;

export interface Outbox {
  readonly service: Service;
  /** The subscribers of each event type, as checked at boot: what the dispatcher is given. */
  readonly subscriptions: Subscriptions;
  /**
   * Writes an event in the transaction of the change it tells of (§3 rule 1): if the transaction
   * does not commit, neither does the event. It must be inside a transaction. The envelope is
   * checked with the event's contract, and an event of another producer or bigger than 16 KB is
   * refused.
   */
  append<C extends AnyEventContract>(
    db: Db,
    session: ClientSession,
    contract: C,
    event: EventInput<C>,
  ): Promise<EventEnvelope<C>>;
}

export interface OutboxOptions {
  /** The producer: every event it writes is of this service. */
  service: Service;
  subscriptions: Subscriptions;
  clock: Clock;
}

/** The subscribers of each event type, checked once at boot. */
export function checkSubscriptions(service: Service, subscriptions: Subscriptions): void {
  for (const [type, subscribers] of Object.entries(subscriptions)) {
    if (!type.startsWith(`${service}.`)) {
      throw new RangeError(`The event ${type} is not of ${service}, so ${service} cannot send it.`);
    }
    const seen = new Set<string>();
    for (const subscriber of subscribers) {
      subscriberService(subscriber);
      if (seen.has(subscriber)) {
        throw new RangeError(`The subscriber ${subscriber} of ${type} is given twice.`);
      }
      seen.add(subscriber);
    }
  }
}

/** The outbox of a producer (docs/ARCHITECTURE.md §3 rules 1, 2 and 7). */
export function createOutbox({ service, subscriptions, clock }: OutboxOptions): Outbox {
  checkSubscriptions(service, subscriptions);
  const subscribersOf = new Map(Object.entries(subscriptions));

  return {
    service,
    subscriptions,
    async append(db, session, contract, event) {
      if (!session.inTransaction()) {
        throw new RangeError(
          `The event ${contract.type} must be written in the transaction of its change.`,
        );
      }
      const producer: string = contract.producer;
      if (producer !== service) {
        throw new RangeError(`The event ${contract.type} is of ${producer}, not ${service}.`);
      }
      const id = new ObjectId();
      const now = clock.now();
      const checked = contract.schema.safeParse({
        ...event,
        eventId: id.toHexString(),
        type: contract.type,
        version: contract.version,
        occurredAt: now.toISOString(),
        producer: contract.producer,
      });
      if (!checked.success) {
        // The messages name the fields, never their values (docs/RULES.md CR-22).
        const issues = checked.error.issues.map((issue) => issue.message).join(' ');
        throw new RangeError(`The event ${contract.type} is not right: ${issues}`);
      }
      const envelope = checked.data as EventEnvelope<typeof contract>;
      const payload = JSON.stringify(envelope);
      if (Buffer.byteLength(payload) > EVENT_MAX_BYTES) {
        throw new RangeError(
          `The event ${contract.type} is more than ${String(EVENT_MAX_BYTES)} bytes: it holds ids and the state that is needed (docs/ARCHITECTURE.md §3 rule 7).`,
        );
      }
      const subscribers = subscribersOf.get(contract.type) ?? [];
      const deliveries: Delivery[] = subscribers.map((subscriber) => ({
        subscriber,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: now,
        deliveredAt: null,
        lastError: null,
      }));
      const { aggregate } = envelope as {
        aggregate: { type: string; id: string; version: number };
      };
      const record: OutboxRecord = {
        _id: id,
        type: contract.type,
        producer: service,
        aggregateKey: `${aggregate.type}:${aggregate.id}`,
        aggregateVersion: aggregate.version,
        occurredAt: now,
        payload,
        deliveries,
        pendingCount: deliveries.length,
        nextAttemptAt: deliveries.length > 0 ? now : null,
        // An event no one takes is done at once.
        doneAt: deliveries.length > 0 ? null : now,
      };
      await db.collection<OutboxRecord>(OUTBOX_COLLECTION).insertOne(record, { session });
      return envelope;
    },
  };
}

const PENDING = {
  $filter: { input: '$deliveries', as: 'd', cond: { $eq: ['$$d.status', 'pending'] } },
};

/**
 * The stages that every change of a delivery ends with: the event's `pendingCount`, its soonest
 * `nextAttemptAt` and its `doneAt` follow from its deliveries, in the same atomic update.
 */
export function summaryStages(now: Date): Document[] {
  return [
    { $set: { pendingCount: { $size: PENDING } } },
    {
      $set: {
        nextAttemptAt: { $min: { $map: { input: PENDING, as: 'd', in: '$$d.nextAttemptAt' } } },
      },
    },
    {
      $set: {
        doneAt: {
          $cond: [
            {
              $allElementsTrue: [
                {
                  $map: { input: '$deliveries', as: 'd', in: { $eq: ['$$d.status', 'delivered'] } },
                },
              ],
            },
            { $ifNull: ['$doneAt', { $literal: now }] },
            null,
          ],
        },
      },
    },
  ];
}

/** A stage that changes one subscriber's delivery (when `where` holds of it) with the given fields. */
export function deliveryStage(
  subscriber: string,
  changes: Partial<Delivery>,
  where: Document[] = [],
): Document {
  const literal = Object.fromEntries(
    Object.entries(changes).map(([key, value]) => [key, { $literal: value }]),
  );
  return {
    $set: {
      deliveries: {
        $map: {
          input: '$deliveries',
          as: 'd',
          in: {
            $cond: [
              { $and: [{ $eq: ['$$d.subscriber', subscriber] }, ...where] },
              { $mergeObjects: ['$$d', literal] },
              '$$d',
            ],
          },
        },
      },
    },
  };
}

/**
 * Tries a dead delivery again (from the Master app, with its permission, §3 rule 6): it is pending
 * at once with its count from 0, and the later events of its aggregate that it held up for that
 * subscriber are due at once too, to go in order after it. `false` when it was not dead.
 */
export async function retryDeadDelivery(
  db: Db,
  { eventId, subscriber, now }: { eventId: string; subscriber: string; now: Date },
): Promise<boolean> {
  const outbox = db.collection<OutboxRecord>(OUTBOX_COLLECTION);
  const _id = ObjectId.createFromHexString(eventId);
  const event = await outbox.findOneAndUpdate(
    { _id, deliveries: { $elemMatch: { subscriber, status: 'dead' } } },
    [
      deliveryStage(subscriber, {
        status: 'pending',
        attempts: 0,
        nextAttemptAt: now,
        lastError: null,
      }),
      ...summaryStages(now),
    ],
    { projection: { aggregateKey: 1 }, maxTimeMS: QUERY_MAX_TIME_MS },
  );
  if (event === null) return false;
  await outbox.updateMany(
    {
      aggregateKey: event.aggregateKey,
      deliveries: { $elemMatch: { subscriber, status: 'pending', nextAttemptAt: { $gt: now } } },
    },
    [
      deliveryStage(subscriber, { nextAttemptAt: now }, [{ $eq: ['$$d.status', 'pending'] }]),
      ...summaryStages(now),
    ],
    { maxTimeMS: QUERY_MAX_TIME_MS },
  );
  return true;
}
