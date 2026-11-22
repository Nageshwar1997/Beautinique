import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { CliError } from './errors.ts';
import { createRunner, type Runner } from './exec.ts';
import { consoleLogger, type Logger } from './log.ts';
import { inquirerPrompter, noPrompter, type Prompter } from './prompts.ts';

export const CATEGORIES = ['shared', 'frontend', 'backend'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Both ends are a terminal (Node leaves isTTY undefined otherwise, whatever the types say). */
const tty = (stream: { isTTY?: boolean }) => stream.isTTY === true;
export const isTerminal = (): boolean => tty(process.stdin) && tty(process.stdout);

export const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

export interface Repository {
  /** e.g. https://github.com/Nageshwar1997/Beautinique */
  web: string;
  /** e.g. git+https://github.com/Nageshwar1997/Beautinique.git */
  url: string;
  /** e.g. Nageshwar1997/Beautinique */
  slug: string;
}

export interface Context {
  root: string;
  scope: string;
  registry: string;
  repository: Repository;
  author: string;
  license: string;
  log: Logger;
  run: Runner;
  prompt: Prompter;
  /** false for --yes, --ci and when stdin/stdout is not a terminal */
  interactive: boolean;
  fetch: typeof fetch;
  /** "now" for changelogs, injectable for tests */
  today: () => string;
}

/** The monorepo root: BEAUTINIQUE_ROOT, or the nearest folder (from cwd up) whose package.json has workspaces. */
export function findRoot(start = process.cwd()): string {
  const fromEnv = process.env.BEAUTINIQUE_ROOT;
  if (fromEnv) {
    return resolve(fromEnv);
  }
  let dir = resolve(start);
  for (;;) {
    const file = join(dir, 'package.json');
    if (existsSync(file)) {
      const manifest = JSON.parse(readFileSync(file, 'utf8')) as { workspaces?: unknown };
      if (Array.isArray(manifest.workspaces)) {
        return dir;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new CliError('Could not find the monorepo root (a package.json with "workspaces").', {
        code: 'NO_ROOT',
        hint: 'Run the command from inside the Beautinique repository.',
      });
    }
    dir = parent;
  }
}

export function parseRepository(url: string): Repository {
  const match = /github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?\/?$/.exec(url);
  if (!match) {
    throw new CliError(`The root package.json repository "${url}" is not a GitHub URL.`, {
      code: 'BAD_REPOSITORY',
    });
  }
  const slug = `${match[1] ?? ''}/${match[2] ?? ''}`;
  return { web: `https://github.com/${slug}`, url: `git+https://github.com/${slug}.git`, slug };
}

interface RootManifest {
  author?: string;
  license?: string;
  repository?: string | { url?: string };
}

export interface ContextOptions {
  interactive?: boolean;
  /** --yes / --ci: confirmations pass without a terminal */
  assumeYes?: boolean;
  flagHint?: string;
  overrides?: Partial<Context>;
}

export function createContext(options: ContextOptions = {}): Context {
  const root = options.overrides?.root ?? findRoot();
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as RootManifest;
  const repoUrl =
    typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url;
  if (!repoUrl) {
    throw new CliError('The root package.json has no "repository".', { code: 'BAD_REPOSITORY' });
  }
  const registry = (process.env.BEAUTINIQUE_REGISTRY ?? DEFAULT_REGISTRY).replace(/\/?$/, '/');
  const interactive = options.interactive ?? isTerminal();
  return {
    root,
    scope: '@beautinique',
    registry,
    repository: parseRepository(repoUrl),
    author: manifest.author ?? 'Nageshwar Pawar',
    license: manifest.license ?? 'MIT',
    log: consoleLogger(),
    run: createRunner(),
    prompt: interactive
      ? inquirerPrompter()
      : noPrompter(
          options.flagHint ?? 'Run it in a terminal, or pass the flags (see --help).',
          options.assumeYes ?? false,
        ),
    interactive,
    fetch: globalThis.fetch,
    today: () => new Date().toISOString().slice(0, 10),
    ...options.overrides,
  };
}
