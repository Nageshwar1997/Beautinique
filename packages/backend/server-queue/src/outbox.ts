import type { ClientSession, Document, Mongo } from '@beautinique/backend-server-mongo';
import type { EventDefinition, EventEnvelope } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

/** The deployable's outbox: events written with the change that caused them, sent on by the relay. */
export const OUTBOX = 'platform_outbox';

/** Relayed events stay this long: the Redis wipe redrive replays the last 48 hours (ARCHITECTURE §6.6). */
export const OUTBOX_KEEP_SECONDS = 72 * 60 * 60;

/**
 * The largest envelope (as JSON): every job carries its whole event, because a consumer may only read
 * its own database (ARCHITECTURE §6.1), and Redis is small. Events hold ids and small facts.
 */
export const EVENT_MAX_BYTES = 16 * 1024;

export interface OutboxRecord {
  /** The event id (UUIDv7, so ids sort by time). */
  _id: string;
  type: string;
  version: number;
  envelope: Document;
  status: 'pending' | 'relayed';
  createdAt: Date;
  relayedAt?: Date;
  /** How many subscriber jobs the relay made (0 = nobody listens to this type yet). */
  subscribers?: number;
}

/** What the caller gives; the outbox fills in id, type, version, producer and time. */
export interface EventInput<Definition extends EventDefinition> {
  aggregate: { type: string; id: string };
  actor: EventEnvelope<Definition>['actor'];
  /** The request id that started it all (the gateway's X-Request-Id). */
  correlationId: string;
  /** The event that caused this one, if any. */
  causationId?: string | null;
  scope?: EventEnvelope<Definition>['scope'];
  data: EventEnvelope<Definition>['data'];
}

/** The outbox's indexes: pending events by age (relay), and expiry of relayed ones. Safe to repeat. */
export async function ensureOutboxIndexes(mongo: Mongo): Promise<void> {
  const outbox = mongo.db.collection<OutboxRecord>(OUTBOX);
  await outbox.createIndex({ status: 1, createdAt: 1 }, { name: 'status_createdAt' });
  await outbox.createIndex(
    { relayedAt: 1 },
    { name: 'relayed_expiry', expireAfterSeconds: OUTBOX_KEEP_SECONDS },
  );
}

/**
 * Writes an event to the outbox inside the transaction that makes the change, so the event exists
 * exactly when the change does (ARCHITECTURE §5.2). The envelope is checked against the event's
 * contract here, so a wrong event fails the request instead of a consumer later.
 */
export async function writeEvent<Definition extends EventDefinition>(
  mongo: Mongo,
  session: ClientSession,
  definition: Definition,
  input: EventInput<Definition>,
): Promise<EventEnvelope<Definition>> {
  if (!session.inTransaction()) {
    throw new Error(
      `writeEvent("${definition.type}") must run inside withTransaction, so the event commits ` +
        'together with the change that caused it.',
    );
  }
  const envelope = definition.envelope.parse({
    eventId: uuidv7(),
    type: definition.type,
    version: definition.version,
    occurredAt: new Date().toISOString(),
    producer: definition.producer,
    aggregate: input.aggregate,
    actor: input.actor,
    correlationId: input.correlationId,
    causationId: input.causationId ?? null,
    scope: input.scope ?? null,
    data: input.data,
  }) as EventEnvelope<Definition>;
  const bytes = Buffer.byteLength(JSON.stringify(envelope));
  if (bytes > EVENT_MAX_BYTES) {
    throw new Error(
      `Event "${definition.type}" is ${String(bytes)} bytes; the limit is ${String(EVENT_MAX_BYTES)}. ` +
        'Put ids and small facts in an event; the details stay in your database.',
    );
  }
  await mongo.db.collection<OutboxRecord>(OUTBOX).insertOne(
    {
      _id: envelope.eventId,
      type: envelope.type,
      version: envelope.version,
      envelope,
      status: 'pending',
      createdAt: new Date(),
    },
    { session },
  );
  return envelope;
}
