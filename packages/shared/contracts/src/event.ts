import {
  enum as enumOf,
  iso,
  literal,
  number,
  strictObject,
  string,
  unknown,
  type ZodRawShape,
} from 'zod';

import { SERVICES, type Service } from './constants/services.ts';

/** An event is at most this big once it is JSON (docs/ARCHITECTURE.md §3 rule 7). */
export const EVENT_MAX_BYTES = 16 * 1024;

// Names that never belong in an event: a secret, a code, a bank or PAN number, a whole address
// (docs/ARCHITECTURE.md §3 rule 8). An event holds ids and the state that is needed; whoever needs
// more asks the owner.
const FORBIDDEN_DATA_KEYS = new Set([
  'otp',
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'cookie',
  'deliverycode',
  'pan',
  'bankaccount',
  'accountnumber',
  'address',
]);

const EVENT_TYPE_FORMAT = new RegExp(
  `^(${SERVICES.join('|')})\\.[a-z][A-Za-z0-9]*\\.[a-z][A-Za-z0-9]*$`,
);

/**
 * The envelope every event has (docs/ARCHITECTURE.md §3 rule 7). What `data` holds, and which
 * type, version and producer, is given by `defineEvent`.
 */
export const eventEnvelopeSchema = strictObject(
  {
    eventId: string('eventId is required.')
      .min(1, 'eventId is required.')
      .max(64, 'eventId must be at most 64 characters.'),
    type: string('type is required.').regex(
      EVENT_TYPE_FORMAT,
      'type must be <service>.<aggregate>.<pastTense>, with a service of the list.',
    ),
    version: number('version must be a number.')
      .int('version must be a whole number.')
      .min(1, 'version must be at least 1.'),
    occurredAt: iso.datetime({
      error: 'occurredAt must be a UTC date and time, like 2026-11-26T09:00:00.000Z.',
    }),
    producer: enumOf(SERVICES, 'producer must be a service of the list.'),
    aggregate: strictObject(
      {
        type: string('aggregate.type is required.')
          .min(1, 'aggregate.type is required.')
          .max(64, 'aggregate.type must be at most 64 characters.'),
        id: string('aggregate.id is required.')
          .min(1, 'aggregate.id is required.')
          .max(64, 'aggregate.id must be at most 64 characters.'),
        version: number('aggregate.version must be a number.')
          .int('aggregate.version must be a whole number.')
          .min(0, 'aggregate.version must be at least 0.'),
      },
      'aggregate must be { type, id, version }.',
    ),
    actor: strictObject(
      {
        type: enumOf(['account', 'system'], 'actor.type must be account or system.'),
        id: string('actor.id is required.')
          .min(1, 'actor.id is required.')
          .max(64, 'actor.id must be at most 64 characters.'),
      },
      'actor must be { type, id }.',
    ),
    correlationId: string('correlationId is required.')
      .min(1, 'correlationId is required.')
      .max(64, 'correlationId must be at most 64 characters.'),
    causationId: string('causationId is required.')
      .min(1, 'causationId is required.')
      .max(64, 'causationId must be at most 64 characters.'),
    data: unknown(),
  },
  'An event must have the fields of the envelope and nothing else.',
);

// The envelope of one event: its own type, version and producer, and its own `data`, nothing else.
function envelopeOf<T extends string, V extends number, S extends Service, D extends ZodRawShape>(
  type: T,
  version: V,
  producer: S,
  data: D,
) {
  return eventEnvelopeSchema.extend({
    type: literal(type),
    version: literal(version),
    producer: literal(producer),
    data: strictObject(data),
  });
}

type ServiceOf<T extends string> = T extends `${infer S extends Service}.${string}` ? S : never;

export interface EventDefinition<T extends string, V extends number, D extends ZodRawShape> {
  /** `<service>.<aggregate>.<pastTense>`, like `commerce.order.placed`. The service is the producer. */
  type: T;
  /** The version of the shape of `data`. A change that breaks a reader is a new version. */
  version: V;
  /** The fields of `data`. */
  data: D;
  description: string;
}

export interface EventContract<T extends string, V extends number, D extends ZodRawShape> {
  readonly type: T;
  readonly version: V;
  readonly producer: ServiceOf<T>;
  readonly description: string;
  /** The envelope of this event. An event of another producer, type or version is refused. */
  readonly schema: ReturnType<typeof envelopeOf<T, V, ServiceOf<T>, D>>;
}

/** The type of an event, its version, the fields of its `data`, and so its producer. */
export function defineEvent<T extends string, V extends number, D extends ZodRawShape>(
  event: EventDefinition<T, V, D>,
): EventContract<T, V, D> {
  if (!EVENT_TYPE_FORMAT.test(event.type)) {
    throw new RangeError(
      `The event type ${event.type} is not <service>.<aggregate>.<pastTense>, with a service of the list.`,
    );
  }
  if (!Number.isInteger(event.version) || event.version < 1) {
    throw new RangeError(`The version of ${event.type} is a whole number from 1.`);
  }
  const forbidden = Object.keys(event.data).filter((key) =>
    FORBIDDEN_DATA_KEYS.has(key.toLowerCase()),
  );
  if (forbidden.length > 0) {
    throw new RangeError(
      `The event ${event.type} has ${forbidden.join(', ')} in its data: a secret, a code or personal data never goes in an event.`,
    );
  }
  const producer = event.type.slice(0, event.type.indexOf('.')) as ServiceOf<T>;
  return Object.freeze({
    type: event.type,
    version: event.version,
    producer,
    description: event.description,
    schema: envelopeOf(event.type, event.version, producer, event.data),
  });
}
