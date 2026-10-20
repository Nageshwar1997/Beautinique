import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { type Context, parseRepository } from '../lib/context.ts';
import type { Command, RunOptions, RunResult } from '../lib/exec.ts';
import { type MemoryLogger, memoryLogger } from '../lib/log.ts';
import { type ScriptedPrompter, scriptedPrompter } from '../lib/prompts.ts';
import type { RegistryPackage } from '../lib/registry.ts';
import type { PackageManifest } from '../lib/workspace.ts';

export interface FixturePackage {
  /** e.g. packages/shared/utils or frontend/customer */
  dir: string;
  manifest: Partial<PackageManifest> & { name: string; version: string };
  files?: Record<string, string>;
}

export const LICENSE_TEXT = 'MIT License\n\nCopyright (c) 2026 Test\n';

/** A public package manifest that passes every rule (exports ./index.js, README, LICENSE). */
export function publicPackage(
  category: string,
  folder: string,
  version: string,
  extra: Partial<PackageManifest> = {},
): FixturePackage {
  return {
    dir: `packages/${category}/${folder}`,
    manifest: {
      name: `@beautinique/${category}-${folder}`,
      version,
      type: 'module',
      exports: { '.': './index.js', './package.json': './package.json' },
      files: ['index.js'],
      license: 'MIT',
      publishConfig: { access: 'public' },
      ...extra,
    },
    files: {
      'index.js': 'export const value = 1;\n',
      'README.md': `# @beautinique/${category}-${folder}\n`,
      LICENSE: LICENSE_TEXT,
    },
  };
}

export function privatePackage(
  dir: string,
  name: string,
  extra: Partial<PackageManifest> = {},
): FixturePackage {
  return { dir, manifest: { name, version: '1.0.0', private: true, ...extra } };
}

/** A throwaway monorepo on disk. Remove it with `cleanup()`. */
export function makeRepo(
  packages: FixturePackage[],
  workspaces = ['packages/*/*', 'frontend/*', 'backend/*'],
) {
  const root = mkdtempSync(join(tmpdir(), 'bq-cli-'));
  const write = (file: string, text: string) => {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  };
  write(
    'package.json',
    `${JSON.stringify(
      {
        name: 'fixture',
        private: true,
        author: 'Test Author',
        license: 'MIT',
        repository: { type: 'git', url: 'git+https://github.com/example/fixture.git' },
        workspaces,
      },
      null,
      2,
    )}\n`,
  );
  write('LICENSE', LICENSE_TEXT);
  for (const pkg of packages) {
    write(`${pkg.dir}/package.json`, `${JSON.stringify(pkg.manifest, null, 2)}\n`);
    for (const [file, text] of Object.entries(pkg.files ?? {})) {
      write(`${pkg.dir}/${file}`, text);
    }
  }
  // Windows can hold a handle (git, npm) for a moment after a child exits: retry, never fail a test on it
  const cleanup = () => {
    try {
      rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    } catch {
      // a leftover folder in the OS temp dir is harmless
    }
  };
  return { root, write, cleanup };
}

export interface RunCall {
  command: Command;
  args: string[];
  options: RunOptions;
}

export type FakeResponder = (call: RunCall) => Partial<RunResult> | undefined;

/** Registry documents keyed by package name; anything missing is a 404. */
export function fakeFetch(packages: Record<string, RegistryPackage>): typeof fetch {
  return (input) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const name = decodeURIComponent(new URL(url).pathname.slice(1));
    const pkg = packages[name];
    if (!pkg) {
      return Promise.resolve(new Response('{"error":"Not found"}', { status: 404 }));
    }
    const versions = Object.fromEntries(pkg.versions.map((v) => [v, { version: v }]));
    return Promise.resolve(Response.json({ name, versions, 'dist-tags': pkg.distTags }));
  };
}

export interface TestContext extends Context {
  log: MemoryLogger;
  prompt: ScriptedPrompter;
  calls: RunCall[];
}

/** A context whose npm/git calls go to `respond` (default: success, empty output). */
export function testContext(
  root: string,
  options: {
    answers?: unknown[];
    registry?: Record<string, RegistryPackage>;
    respond?: FakeResponder;
    interactive?: boolean;
  } = {},
): TestContext {
  const calls: RunCall[] = [];
  const run = (command: Command, args: string[], runOptions: RunOptions = {}) => {
    const call = { command, args, options: runOptions };
    calls.push(call);
    const res = options.respond?.(call) ?? {};
    return Promise.resolve({
      code: res.code ?? 0,
      stdout: res.stdout ?? '',
      stderr: res.stderr ?? '',
    });
  };
  return {
    root,
    scope: '@beautinique',
    registry: 'https://registry.example.test/',
    repository: parseRepository('git+https://github.com/example/fixture.git'),
    author: 'Test Author',
    license: 'MIT',
    log: memoryLogger(),
    run,
    prompt: scriptedPrompter(options.answers ?? []),
    interactive: options.interactive ?? true,
    fetch: fakeFetch(options.registry ?? {}),
    today: () => '2026-10-20',
    calls,
  };
}

/** npm registry shape for a list of published versions (latest = last). */
export const onNpm = (...versions: string[]): RegistryPackage => ({
  versions,
  distTags: { latest: versions.at(-1) ?? '' },
});
