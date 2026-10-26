import type { AppId } from '@beautinique/shared-contracts';

/** Longest DNS label: Vercel cuts preview names to fit it (ARCHITECTURE §11.4). */
const MAX_LABEL = 63;

/** Which host belongs to which of the 11 apps: exact production and dev hosts, plus Vercel previews. */
export interface AppRegistry {
  /** the app of a host (`bq-customer.vercel.app`, `localhost:3001`), or null when it is no app's */
  appOf(host: string): AppId | null;
}

export interface AppRegistryOptions {
  /** exact host (lower case, with a port when it has one) → app */
  hosts: ReadonlyMap<string, AppId>;
  /** each app's Vercel project, for its preview hosts */
  vercelProjects: readonly (readonly [AppId, string])[];
  /** the Vercel scope slug that ends the account's preview hosts */
  vercelScope: string | undefined;
}

/**
 * The app allow-list (ARCHITECTURE §7.2, §11.4): exact hosts, and for previews only
 * `<project>-(git-<branch>|<9 chars>)-<scope>.vercel.app`, never any `*.vercel.app`. Project and
 * scope are slugs (checked in config), so they are safe inside the pattern.
 */
export function appRegistry({
  hosts,
  vercelProjects,
  vercelScope,
}: AppRegistryOptions): AppRegistry {
  const previews =
    vercelScope === undefined
      ? []
      : vercelProjects.map(([app, project]) => ({
          app,
          pattern: new RegExp(
            `^${project}-(?:git-[a-z0-9-]+|[a-z0-9]{9})-${vercelScope}\\.vercel\\.app$`,
          ),
        }));
  return {
    appOf(raw) {
      const host = normalizeHost(raw);
      const exact = hosts.get(host);
      if (exact !== undefined) return exact;
      if (host.length - '.vercel.app'.length > MAX_LABEL) return null;
      return previews.find(({ pattern }) => pattern.test(host))?.app ?? null;
    },
  };
}

/** A host as the allow-list keeps it: trimmed, lower case, without a trailing dot. */
export const normalizeHost = (host: string): string => host.trim().toLowerCase().replace(/\.$/, '');

/** The host of an Origin header (`https://a.example:8443` → `a.example:8443`), or null when it has none. */
export function originHost(origin: string): string | null {
  try {
    const { protocol, host } = new URL(origin);
    return protocol === 'https:' || protocol === 'http:' ? host : null;
  } catch {
    return null;
  }
}
