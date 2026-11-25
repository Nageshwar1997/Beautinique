import type { input, output, ZodType } from 'zod';

import { SERVICES, type Service } from './constants/services.ts';

export interface SettingDefinition<S extends ZodType> {
  /** `<service>.<name>`, with more names after a dot, like `gateway.rateLimit.signIn.perIp`. */
  key: `${Service}.${string}`;
  /** The shape of the value. */
  schema: S;
  /** What the value is until the owner changes it. It must pass `schema`. */
  defaultValue: input<S>;
  description: string;
}

export interface Setting<S extends ZodType> {
  readonly key: `${Service}.${string}`;
  readonly schema: S;
  readonly defaultValue: output<S>;
  readonly description: string;
}

const KEY_FORMAT = new RegExp(`^(${SERVICES.join('|')})(\\.[a-z][A-Za-z0-9]*)+$`);

/** The key of a setting, the shape of its value and what it is at the start. */
export function defineSetting<S extends ZodType>(setting: SettingDefinition<S>): Setting<S> {
  if (!KEY_FORMAT.test(setting.key)) {
    throw new RangeError(`The settings key ${setting.key} is not <service>.<name>, in camelCase.`);
  }
  const parsed = setting.schema.safeParse(setting.defaultValue);
  if (!parsed.success) {
    throw new RangeError(`The default value of ${setting.key} does not pass its own schema.`);
  }
  return Object.freeze({
    key: setting.key,
    schema: setting.schema,
    defaultValue: parsed.data,
    description: setting.description,
  });
}
