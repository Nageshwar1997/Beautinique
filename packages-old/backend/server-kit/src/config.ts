import type { output, ZodObject } from '@beautinique/shared-zod';

/** `mongoUri` → `MONGO_URI` */
export const toEnvKey = (key: string): string =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export interface LoadConfigOptions {
  /** the deployable's prefix: IDENTITY reads IDENTITY__PORT, IDENTITY__MONGO_URI ... */
  prefix: string;
  /** default process.env */
  env?: Record<string, string | undefined>;
  /** delete this deployable's keys from env after reading (bundle mode: one process, many services) */
  strip?: boolean;
}

/**
 * Reads a deployable's settings from namespaced env vars (ARCHITECTURE §3: `IDENTITY__MONGO_URI`)
 * and validates them with the schema (camelCase keys; use coerce for numbers and booleans). Errors
 * name the env vars and never print values. A key with the prefix that the schema does not know is
 * an error too (a typo would otherwise be ignored silently).
 */
export function loadConfig<Schema extends ZodObject>(
  schema: Schema,
  { prefix, env = process.env, strip = false }: LoadConfigOptions,
): output<Schema> {
  if (!/^[A-Z][A-Z0-9]*$/.test(prefix)) {
    throw new Error(`Config prefix must be UPPER case letters and digits, got "${prefix}"`);
  }
  const keys = Object.keys(schema.shape);
  const envKeys = new Map(keys.map((key) => [`${prefix}__${toEnvKey(key)}`, key]));
  const raw: Record<string, string> = {};
  for (const [envKey, key] of envKeys) {
    const value = env[envKey];
    if (value !== undefined && value !== '') raw[key] = value;
  }
  const unknown = Object.keys(env).filter((k) => k.startsWith(`${prefix}__`) && !envKeys.has(k));
  const parsed = schema.safeParse(raw);
  const problems = [
    ...unknown.map((k) => `  ${k}: not a setting of ${prefix} (typo?)`),
    ...(parsed.success
      ? []
      : parsed.error.issues.map((issue) => {
          const key = String(issue.path[0] ?? '');
          return `  ${prefix}__${toEnvKey(key)}: ${issue.message}`;
        })),
  ];
  if (problems.length > 0 || !parsed.success) {
    throw new ConfigError(`Invalid ${prefix} configuration:\n${problems.join('\n')}`);
  }
  if (strip) {
    for (const key of Object.keys(env)) {
      if (key.startsWith(`${prefix}__`)) Reflect.deleteProperty(env, key);
    }
  }
  return parsed.data;
}
