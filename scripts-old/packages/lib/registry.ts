import type { Context } from './context.ts';
import { CliError } from './errors.ts';

/** The parts of one published version that update-deps looks at (npm's own field names). */
export interface VersionDetails {
  deprecated?: string;
  engines?: { node?: string };
  peerDependencies?: Record<string, string>;
}

/** What npm knows about a package. null from fetchPackage means "never published". */
export interface RegistryPackage {
  versions: string[];
  distTags: Record<string, string>;
  /** per version; missing for a version means it has none of these fields */
  details?: Record<string, VersionDetails>;
}

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((v) => typeof v === 'string');

/** Keeps only well-formed fields: old packages have odd shapes (engines as an array, deprecated: ""). */
export function versionDetails(raw: unknown): VersionDetails {
  const doc = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const node =
    typeof doc.engines === 'object' && doc.engines !== null && !Array.isArray(doc.engines)
      ? (doc.engines as { node?: unknown }).node
      : undefined;
  return {
    ...(typeof doc.deprecated === 'string' && doc.deprecated !== ''
      ? { deprecated: doc.deprecated }
      : {}),
    ...(typeof node === 'string' ? { engines: { node } } : {}),
    ...(isStringRecord(doc.peerDependencies) ? { peerDependencies: doc.peerDependencies } : {}),
  };
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
        const versions = doc.versions ?? {};
        return {
          versions: Object.keys(versions),
          distTags: doc['dist-tags'] ?? {},
          details: Object.fromEntries(
            Object.entries(versions).map(([v, raw]) => [v, versionDetails(raw)]),
          ),
        };
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
