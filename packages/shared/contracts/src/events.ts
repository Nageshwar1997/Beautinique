import type {
  output,
  ZodLiteral,
  ZodNullable,
  ZodObject,
  ZodString,
  ZodType,
} from '@beautinique/shared-zod';
import {
  array,
  enum as zodEnum,
  isoDateTimeZod,
  literal,
  object,
  string,
  uuidv7Zod,
} from '@beautinique/shared-zod';

import { type Deployable, DEPLOYABLES, SCOPE_TYPES } from './platform';

/** `<context>.<aggregate>.<pastTense>` in camelCase parts, e.g. `sellers.org.approved`. */
const EVENT_TYPE = /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/;

/** Who caused an event. */
export const eventActor = object({
  type: zodEnum(['user', 'system', 'partner']),
  id: string().min(1),
});

/** The scope an event belongs to (for routing reviews and filtering read models). */
export const eventScope = object({
  type: zodEnum(SCOPE_TYPES),
  ids: array(string().min(1)),
});

export interface EventDefinition<
  Type extends string = string,
  Version extends number = number,
  Data extends ZodType = ZodType,
> {
  type: Type;
  version: Version;
  producer: Deployable;
  description: string;
  data: Data;
  /** The whole envelope (ARCHITECTURE §5.2), validated by producer and consumer alike. */
  envelope: ZodObject<{
    eventId: typeof uuidv7Zod;
    type: ZodLiteral<Type>;
    version: ZodLiteral<Version>;
    occurredAt: typeof isoDateTimeZod;
    producer: ZodLiteral<Deployable>;
    aggregate: ZodObject<{ type: ZodString; id: ZodString }>;
    actor: typeof eventActor;
    correlationId: ZodString;
    causationId: ZodNullable<ZodString>;
    scope: ZodNullable<typeof eventScope>;
    data: Data;
  }>;
}

/**
 * Declares an event type and version once. A breaking change to `data` is a new version, declared
 * next to the old one. Wrong declarations throw.
 */
export function defineEvent<
  const Type extends string,
  const Version extends number,
  Data extends ZodType,
>(definition: {
  type: Type;
  version: Version;
  producer: Deployable;
  description: string;
  data: Data;
}): EventDefinition<Type, Version, Data> {
  const { type, version, producer, description, data } = definition;
  if (!EVENT_TYPE.test(type)) {
    throw new Error(`Event "${type}" must look like <context>.<aggregate>.<pastTense>`);
  }
  if (!Number.isInteger(version) || version < 1) {
    throw new Error(`Event "${type}" version must be a whole number from 1`);
  }
  if (!(DEPLOYABLES as readonly string[]).includes(producer)) {
    throw new Error(`Event "${type}" has an unknown producer "${producer}"`);
  }
  if (description.trim() === '') {
    throw new Error(`Event "${type}" needs a description`);
  }
  const envelope = object({
    eventId: uuidv7Zod,
    type: literal(type),
    version: literal(version),
    occurredAt: isoDateTimeZod,
    producer: literal(producer),
    aggregate: object({ type: string().min(1), id: string().min(1) }),
    actor: eventActor,
    correlationId: string().min(1),
    causationId: string().min(1).nullable(),
    scope: eventScope.nullable(),
    data,
  });
  return Object.freeze({ type, version, producer, description, data, envelope });
}

/** The full event envelope type of a definition. */
export type EventEnvelope<Definition extends EventDefinition> = output<Definition['envelope']>;

/**
 * All events of the platform by `type@vN`. Duplicates throw, and so does a type whose versions do
 * not run 1, 2, 3 ... without gaps.
 */
export function eventCatalogue(definitions: readonly EventDefinition[]) {
  const byKey = new Map<string, EventDefinition>();
  const versions = new Map<string, number[]>();
  for (const definition of definitions) {
    const key = `${definition.type}@v${String(definition.version)}`;
    if (byKey.has(key)) throw new Error(`Event ${key} is declared twice`);
    byKey.set(key, definition);
    versions.set(definition.type, [...(versions.get(definition.type) ?? []), definition.version]);
  }
  for (const [type, list] of versions) {
    const sorted = list.toSorted((a, b) => a - b);
    if (sorted.some((v, i) => v !== i + 1)) {
      throw new Error(
        `Event "${type}" versions must be 1..n without gaps, got ${sorted.join(', ')}`,
      );
    }
  }
  return {
    /** The definition of one type and version, or undefined. */
    get(type: string, version: number): EventDefinition | undefined {
      return byKey.get(`${type}@v${String(version)}`);
    },
    /** The newest version of a type (what producers emit), or undefined. */
    latest(type: string): EventDefinition | undefined {
      const list = versions.get(type);
      return list ? byKey.get(`${type}@v${String(Math.max(...list))}`) : undefined;
    },
    all(): EventDefinition[] {
      return [...byKey.values()];
    },
  };
}
