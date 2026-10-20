import { isoDateTime, uuidv7 } from '@beautinique/shared-zod';
import * as z from 'zod';

import { type Deployable, DEPLOYABLES, SCOPE_TYPES } from './platform';

/** `<context>.<aggregate>.<pastTense>` in camelCase parts, e.g. `sellers.org.approved`. */
const EVENT_TYPE = /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/;

/** Who caused an event. */
export const eventActor = z.object({
  type: z.enum(['user', 'system', 'partner']),
  id: z.string().min(1),
});

/** The scope an event belongs to (for routing reviews and filtering read models). */
export const eventScope = z.object({
  type: z.enum(SCOPE_TYPES),
  ids: z.array(z.string().min(1)),
});

export interface EventDefinition<
  Type extends string = string,
  Version extends number = number,
  Data extends z.ZodType = z.ZodType,
> {
  type: Type;
  version: Version;
  producer: Deployable;
  description: string;
  data: Data;
  /** The whole envelope (ARCHITECTURE §5.2), validated by producer and consumer alike. */
  envelope: z.ZodObject<{
    eventId: typeof uuidv7;
    type: z.ZodLiteral<Type>;
    version: z.ZodLiteral<Version>;
    occurredAt: typeof isoDateTime;
    producer: z.ZodLiteral<Deployable>;
    aggregate: z.ZodObject<{ type: z.ZodString; id: z.ZodString }>;
    actor: typeof eventActor;
    correlationId: z.ZodString;
    causationId: z.ZodNullable<z.ZodString>;
    scope: z.ZodNullable<typeof eventScope>;
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
  Data extends z.ZodType,
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
  const envelope = z.object({
    eventId: uuidv7,
    type: z.literal(type),
    version: z.literal(version),
    occurredAt: isoDateTime,
    producer: z.literal(producer),
    aggregate: z.object({ type: z.string().min(1), id: z.string().min(1) }),
    actor: eventActor,
    correlationId: z.string().min(1),
    causationId: z.string().min(1).nullable(),
    scope: eventScope.nullable(),
    data,
  });
  return Object.freeze({ type, version, producer, description, data, envelope });
}

/** The full event envelope type of a definition. */
export type EventEnvelope<Definition extends EventDefinition> = z.output<Definition['envelope']>;

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
