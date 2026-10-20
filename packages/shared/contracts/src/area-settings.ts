import type { output, ZodType } from '@beautinique/shared-zod';

/** Area settings levels, widest first. The most specific value set wins (ARCHITECTURE §8). */
export const AREA_LEVELS = ['global', 'state', 'district', 'pincode'] as const;
export type AreaLevel = (typeof AREA_LEVELS)[number];

const SETTING_KEY = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/;

export interface AreaSettingDefinition<
  Key extends string = string,
  Schema extends ZodType = ZodType,
> {
  key: Key;
  description: string;
  schema: Schema;
  /** Used where no level sets a value. */
  defaultValue: output<Schema>;
}

/** Declares an area setting key (delivery promise, cut-off, UPI-on-delivery ...). The default must be valid. */
export function defineAreaSetting<const Key extends string, Schema extends ZodType>(
  definition: AreaSettingDefinition<Key, Schema>,
): Readonly<AreaSettingDefinition<Key, Schema>> {
  if (!SETTING_KEY.test(definition.key)) {
    throw new Error(
      `Area setting "${definition.key}" must look like <area>.<name> (lower_snake parts)`,
    );
  }
  if (definition.description.trim() === '') {
    throw new Error(`Area setting "${definition.key}" needs a description`);
  }
  const parsed = definition.schema.safeParse(definition.defaultValue);
  if (!parsed.success) {
    throw new Error(
      `Area setting "${definition.key}" has an invalid default: ${parsed.error.issues[0]?.message ?? 'invalid'}`,
    );
  }
  return Object.freeze({ ...definition });
}

/** Values set for one setting, per level (state and district by id, pincode by code). */
export interface AreaSettingValues<Value> {
  global?: Value;
  state?: Readonly<Record<string, Value>>;
  district?: Readonly<Record<string, Value>>;
  pincode?: Readonly<Record<string, Value>>;
}

/** Where we are: the state, district and PIN code of an address, hub or order. */
export interface AreaLocation {
  stateId?: string;
  districtId?: string;
  pincode?: string;
}

/** The value for a location: pincode, then district, then state, then global, then the default. */
export function resolveAreaSetting<Schema extends ZodType>(
  definition: AreaSettingDefinition<string, Schema>,
  values: AreaSettingValues<output<Schema>>,
  location: AreaLocation,
): { value: output<Schema>; level: AreaLevel | 'default' } {
  type Value = output<Schema>;
  // own keys only: an id like "constructor" must not find Object.prototype
  const pick = (map: Readonly<Record<string, Value>> | undefined, id: string | undefined) =>
    id !== undefined && map !== undefined && Object.hasOwn(map, id) ? map[id] : undefined;
  const candidates: [AreaLevel, Value | undefined][] = [
    ['pincode', pick(values.pincode, location.pincode)],
    ['district', pick(values.district, location.districtId)],
    ['state', pick(values.state, location.stateId)],
    ['global', values.global],
  ];
  for (const [level, value] of candidates) {
    if (value !== undefined) {
      return { value, level };
    }
  }
  return { value: definition.defaultValue, level: 'default' };
}
