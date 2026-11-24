import { CliError } from './cli-error.ts';

export const NPM_REGISTRY = 'https://registry.npmjs.org';

export interface Packument {
  /** Every version published, in the order the registry lists them. */
  versions: string[];
  latest: string | undefined;
}

const TIMEOUT_MS = 15_000;

// The registry's document for one package; null when the registry says the package does not exist.
// A registry that cannot be reached is an error, never "not published": a wrong "new" would let a
// publish run against a package that already exists.
export async function fetchPackument(registry: string, name: string): Promise<Packument | null> {
  const url = `${registry}/${name.replace('/', '%2F')}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new CliError(
      'REGISTRY_UNREACHABLE',
      `The registry ${registry} did not answer for ${name}: ${(error as Error).message}`,
      'Check the network and the registry, then run the command again.',
    );
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new CliError(
      'REGISTRY_ERROR',
      `The registry ${registry} answered ${String(response.status)} for ${name}.`,
      'Run the command again in a while; if it keeps failing, check the registry status.',
    );
  }
  const body = (await response.json()) as {
    versions?: Record<string, unknown>;
    'dist-tags'?: Record<string, string>;
  };
  return { versions: Object.keys(body.versions ?? {}), latest: body['dist-tags']?.latest };
}
