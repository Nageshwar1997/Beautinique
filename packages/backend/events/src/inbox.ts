import {
  defineCollection,
  isDuplicateKey,
  mongoCall,
  withTransaction,
} from '@beautinique/backend-mongo';
import { serializeError } from '@beautinique/backend-logger';
import type { Clock } from '@beautinique/shared-clock';
import { EVENT_MAX_BYTES, type EventContract } from '@beautinique/shared-contracts';
import type { ClientSession, Db, MongoClient } from 'mongodb';
import type { output, ZodRawShape } from 'zod';

import { isUnavailable } from './retry.ts';
import { subscriberService } from './subscriber.ts';

/** The consumer's record of each event it has acted on (docs/ARCHITECTURE.md §3 rule 4). */
export const PROCESSED_EVENTS_COLLECTION = 'processed_events';

/** A record of an event acted on goes this long after (§10.2: 14 days, longer than any redelivery). */
export const PROCESSED_EVENTS_TTL_SECONDS = 14 * 24 * 60 * 60;

/** The consumer's events that its handler could not take after every try (§3 rule 6). */
export const DEAD_LETTERS_COLLECTION = 'dead_letters';

/** A dead letter goes this long after it was dealt with (§10.2: 90 days). */
export const DEAD_LETTER_TTL_SECONDS = 90 * 24 * 60 * 60;

export interface ProcessedEventRecord {
  /** `<eventId>:<subscriber>`: one record for one event and one subscriber, so the effect is once. */
  _id: string;
  eventId: string;
  subscriber: string;
  type: string;
  processedAt: Date;
}

export interface DeadLetterRecord {
  /** `<eventId>:<subscriber>`. */
  _id: string;
  eventId: string;
  subscriber: string;
  type: string;
  producer: string;
  /** The envelope as it came, to see what failed. */
  payload: string;
  /** The handler's error: its type, code and a short message with the values masked. */
  error: { type: string; code?: string | number; message: string };
  attempts: number;
  failedAt: Date;
  /** When it was dealt with (delivered after all); the TTL index removes it 90 days after. */
  resolvedAt: Date | null;
}

const NO_PERSONAL_DATA =
  'An event holds ids and the state that is needed, never personal data (docs/ARCHITECTURE.md §3 rule 8).';

/** `processed_events`, for a service's `defineCollections`. */
export const processedEventsCollection = defineCollection({
  name: PROCESSED_EVENTS_COLLECTION,
  retention: 'tech',
  schema: {
    bsonType: 'object',
    required: ['_id', 'eventId', 'subscriber', 'type', 'processedAt'],
    properties: {
      _id: { bsonType: 'string' },
      eventId: { bsonType: 'string' },
      subscriber: { bsonType: 'string' },
      type: { bsonType: 'string' },
      processedAt: { bsonType: 'date' },
    },
  },
  indexes: [
    {
      name: 'processedAt_ttl',
      key: { processedAt: 1 },
      expireAfterSeconds: PROCESSED_EVENTS_TTL_SECONDS,
    },
  ],
  expiry: { ttlIndex: 'processedAt_ttl' },
  accountDelete: { none: NO_PERSONAL_DATA },
});

/** `dead_letters`, for a service's `defineCollections`. */
export const deadLettersCollection = defineCollection({
  name: DEAD_LETTERS_COLLECTION,
  retention: 'tech',
  schema: {
    bsonType: 'object',
    required: ['_id', 'eventId', 'subscriber', 'type', 'payload', 'attempts', 'failedAt'],
    properties: {
      _id: { bsonType: 'string' },
      eventId: { bsonType: 'string' },
      subscriber: { bsonType: 'string' },
      type: { bsonType: 'string' },
      payload: { bsonType: 'string' },
      attempts: { bsonType: 'int', minimum: 1 },
      failedAt: { bsonType: 'date' },
      resolvedAt: { bsonType: ['date', 'null'] },
    },
  },
  indexes: [
    { name: 'resolvedAt_ttl', key: { resolvedAt: 1 }, expireAfterSeconds: DEAD_LETTER_TTL_SECONDS },
  ],
  expiry: { ttlIndex: 'resolvedAt_ttl' },
  accountDelete: { none: NO_PERSONAL_DATA },
});

// Any event contract: what a handler is given for.
type AnyEventContract = EventContract<string, number, ZodRawShape>;

/** What a handler has: the transaction its effect is written in, with the `processed_events` record. */
export interface HandlerContext {
  db: Db;
  session: ClientSession;
  subscriber: string;
}

export interface EventHandler<C extends AnyEventContract = AnyEventContract> {
  contract: C;
  /**
   * The effect of the event, in the transaction that records it as done: it may run more than
   * once (a transient error runs the transaction again), so it does nothing outside the database.
   */
  handle(event: output<C['schema']>, context: HandlerContext): Promise<void>;
}

/** A handler of one event at one version; a subscriber that takes two versions has two (§3 rule 9). */
export function onEvent<C extends AnyEventContract>(
  contract: C,
  handle: EventHandler<C>['handle'],
): EventHandler<C> {
  return { contract, handle };
}

/** What a subscriber says of a try: what the dispatcher writes in its outbox. */
export type DeliveryStatus = 'delivered' | 'failed' | 'dead' | 'unavailable';

export interface DeliveryRequest {
  subscriber: string;
  /** The envelope as JSON text. */
  payload: string;
  /** Which try this is, from 1. */
  attempt: number;
  maxAttempts: number;
}

/** What raises an ops alert (docs/OPERATIONS.md §8: a dead letter is severity 2). */
export interface OpsAlert {
  kind: 'events.deadLetter' | 'events.timerFailed' | 'events.jobFailed';
  severity: 2;
  service: string;
  message: string;
  details: Readonly<Record<string, string | number>>;
}

export type Alert = (alert: OpsAlert) => void | Promise<void>;

/** What the package logs with: the service's logger (`@beautinique/backend-logger`). */
export interface EventsLogger {
  error(fields: Readonly<Record<string, unknown>>, message: string): void;
  warn(fields: Readonly<Record<string, unknown>>, message: string): void;
}

export interface Inbox {
  readonly subscriber: string;
  /** The event types and versions it takes, as `<type>@<version>`. */
  readonly takes: ReadonlySet<string>;
  /**
   * Takes one try of one event: its effect and its `processed_events` record in one transaction,
   * so however often it comes the effect is once (§3 rule 4). A database out of reach is
   * `unavailable` and does not count; the handler's own error is `failed`, and on the last try a
   * dead letter and an alert, `dead` (§3 rule 6, §10.2 rule 11).
   */
  receive(request: DeliveryRequest): Promise<DeliveryStatus>;
}

export interface InboxOptions {
  subscriber: string;
  client: MongoClient;
  db: Db;
  clock: Clock;
  handlers: readonly EventHandler[];
  logger: EventsLogger;
  alert: Alert;
}

const keyOf = (type: string, version: number): string => `${type}@${String(version)}`;

// The effect was there already: the transaction ends with nothing written.
class AlreadyProcessed extends Error {}

/** The inbox of a subscriber (docs/ARCHITECTURE.md §3 rules 4 to 6). */
export function createInbox(options: InboxOptions): Inbox {
  const { subscriber, client, db, clock, logger, alert } = options;
  subscriberService(subscriber);
  const byKey = new Map<string, EventHandler>();
  for (const handler of options.handlers) {
    const key = keyOf(handler.contract.type, handler.contract.version);
    if (byKey.has(key)) throw new RangeError(`${subscriber} has two handlers of ${key}.`);
    byKey.set(key, handler);
  }
  const processed = db.collection<ProcessedEventRecord>(PROCESSED_EVENTS_COLLECTION);
  const deadLetters = db.collection<DeadLetterRecord>(DEAD_LETTERS_COLLECTION);

  async function deadLetter(
    request: DeliveryRequest,
    head: { eventId: string; type: string; producer: string },
    thrown: unknown,
  ): Promise<DeliveryStatus> {
    const { type, code, message } = serializeError(thrown);
    const now = clock.now();
    try {
      await mongoCall(() =>
        deadLetters.updateOne(
          { _id: `${head.eventId}:${subscriber}` },
          {
            $set: {
              eventId: head.eventId,
              subscriber,
              type: head.type,
              producer: head.producer,
              payload: request.payload,
              error: { type, message, ...(code === undefined ? {} : { code }) },
              attempts: request.attempt,
              failedAt: now,
              resolvedAt: null,
            },
          },
          { upsert: true },
        ),
      );
    } catch (written) {
      if (isUnavailable(written)) return 'unavailable';
      throw written;
    }
    const details = { eventId: head.eventId, type: head.type, subscriber };
    logger.error({ ...details, err: thrown }, 'An event went to the dead letters.');
    try {
      await alert({
        kind: 'events.deadLetter',
        severity: 2,
        service: subscriber,
        message: `${subscriber} could not take ${head.type} after ${String(request.attempt)} tries.`,
        details,
      });
    } catch (failed) {
      logger.error({ ...details, err: failed }, 'The alert of a dead letter could not be raised.');
    }
    return 'dead';
  }

  return {
    subscriber,
    takes: new Set(byKey.keys()),
    async receive(request) {
      const head = readHead(request.payload);
      const handler = head === undefined ? undefined : byKey.get(keyOf(head.type, head.version));
      if (head === undefined || handler === undefined) {
        // Not an event this subscriber takes: a wrong wiring, which no try will mend.
        logger.error(
          { subscriber, type: head?.type, version: head?.version },
          'An event came that no handler takes.',
        );
        return 'failed';
      }
      const parsed = handler.contract.schema.safeParse(JSON.parse(request.payload));
      if (!parsed.success) {
        logger.error(
          { subscriber, eventId: head.eventId, issues: parsed.error.issues.map((i) => i.message) },
          'An event did not match its contract.',
        );
        return request.attempt >= request.maxAttempts
          ? deadLetter(request, head, parsed.error)
          : 'failed';
      }
      const id = `${head.eventId}:${subscriber}`;
      try {
        await withTransaction(
          client,
          async (session) => {
            if (
              (await processed.findOne({ _id: id }, { session, projection: { _id: 1 } })) !== null
            ) {
              throw new AlreadyProcessed();
            }
            const now = clock.now();
            try {
              await processed.insertOne(
                { _id: id, eventId: head.eventId, subscriber, type: head.type, processedAt: now },
                { session },
              );
            } catch (thrown) {
              // Another try of the same event committed first.
              if (isDuplicateKey(thrown)) throw new AlreadyProcessed();
              throw thrown;
            }
            await handler.handle(parsed.data, { db, session, subscriber });
            // Taken after all (tried again from the Master app): its dead letter is dealt with.
            await deadLetters.updateOne(
              { _id: id, resolvedAt: null },
              { $set: { resolvedAt: now } },
              { session },
            );
          },
          { clock },
        );
        return 'delivered';
      } catch (thrown) {
        if (thrown instanceof AlreadyProcessed) return 'delivered';
        if (isUnavailable(thrown)) return 'unavailable';
        logger.warn(
          {
            subscriber,
            eventId: head.eventId,
            type: head.type,
            attempt: request.attempt,
            err: thrown,
          },
          'A handler failed on an event.',
        );
        return request.attempt >= request.maxAttempts
          ? deadLetter(request, head, thrown)
          : 'failed';
      }
    },
  };
}

// The few fields of the envelope that say which handler takes it, before the handler's own check.
function readHead(
  payload: string,
): { eventId: string; type: string; version: number; producer: string } | undefined {
  if (Buffer.byteLength(payload) > EVENT_MAX_BYTES) return undefined;
  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return undefined;
  }
  if (typeof json !== 'object' || json === null) return undefined;
  const { eventId, type, version, producer } = json as Record<string, unknown>;
  if (
    typeof eventId !== 'string' ||
    typeof type !== 'string' ||
    typeof version !== 'number' ||
    typeof producer !== 'string'
  ) {
    return undefined;
  }
  return { eventId, type, version, producer };
}
