import type { Context } from './context.ts';
import { CliError } from './errors.ts';

/** What npm knows about a package. null from fetchPackage means "never published". */
export interface RegistryPackage {
  versions: string[];
  distTags: Record<string, string>;
}

const TIMEOUT_MS = 15_000;
const ATTEMPTS = 3;

export function packageUrl(registry: string, name: string): string {
  // npm's own encoding: @scope%2fname
  return new URL(name.replace('/', '%2f'), registry).toString();
}

/** Reads the package document straight from the registry (no npm process: fast, exact JSON). */
export async function fetchPackage(
  ctx: Pick<Context, 'registry' | 'fetch'>,
  name: string,
  options: { fresh?: boolean } = {},
): Promise<RegistryPackage | null> {
  const url = packageUrl(ctx.registry, name);
  let lastError = '';
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const res = await ctx.fetch(url, {
        headers: {
          accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8',
          ...(options.fresh ? { 'cache-control': 'no-cache' } : {}),
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 404) {
        return null;
      }
      if (res.ok) {
        const doc = (await res.json()) as {
          versions?: Record<string, unknown>;
          'dist-tags'?: Record<string, string>;
        };
        return { versions: Object.keys(doc.versions ?? {}), distTags: doc['dist-tags'] ?? {} };
      }
      lastError = `HTTP ${String(res.status)}`;
      if (res.status < 500 && res.status !== 429) {
        break;
      }
    } catch (error) {
      lastError = (error as Error).message;
    }
    if (attempt < ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw new CliError(`Could not read ${name} from ${ctx.registry} (${lastError}).`, {
    code: 'REGISTRY_UNREACHABLE',
    hint: 'Check the internet connection and try again.',
  });
}

/** fetchPackage for many names, a few at a time. */
export async function fetchPackages(
  ctx: Pick<Context, 'registry' | 'fetch'>,
  names: string[],
  concurrency = 8,
): Promise<Map<string, RegistryPackage | null>> {
  const results = new Map<string, RegistryPackage | null>();
  const queue = [...names];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let name = queue.shift(); name !== undefined; name = queue.shift()) {
      results.set(name, await fetchPackage(ctx, name));
    }
  });
  await Promise.all(workers);
  return results;
}

/** Waits until the registry serves name@version (it can take a few seconds after publishing). */
export async function waitForVersion(
  ctx: Pick<Context, 'registry' | 'fetch'>,
  name: string,
  version: string,
  { tries = 10, delayMs = 1500 } = {},
): Promise<boolean> {
  for (let i = 0; i < tries; i += 1) {
    const info = await fetchPackage(ctx, name, { fresh: true }).catch(() => null);
    if (info?.versions.includes(version)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}
