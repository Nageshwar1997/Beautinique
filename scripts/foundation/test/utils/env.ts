// The environment for a nested Turborepo or Vitest run: without the outer run's own TURBO_* (hash,
// invocation folder) and VITEST* variables, which would change how the inner run behaves.
export function cleanEnv(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !/^(VITEST|TURBO_)/.test(key)),
  );
}
