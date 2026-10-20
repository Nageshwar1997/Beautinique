/**
 * Frontend and backend apps from `npm run create`: every kind is generated into a throwaway repo
 * (node_modules linked to this repo's) and its own build, typecheck, lint and tests must pass.
 */
import { spawn } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { makeRepo } from './helpers.ts';
import { type FakeRegistry, startRegistry } from './registry-server.ts';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const BIN = join(REPO_ROOT, 'scripts', 'packages', 'bin', 'create.ts');

let registry: FakeRegistry;
let repo: ReturnType<typeof makeRepo>;

/** A throwaway repo with the real root manifest (workspaces, library versions) and configs. */
function fixtureRepo() {
  const fixture = makeRepo([]);
  const root = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as Record<
    string,
    unknown
  >;
  writeFileSync(
    join(fixture.root, 'package.json'),
    `${JSON.stringify({ ...root, name: 'fixture', scripts: {} }, null, 2)}\n`,
  );
  cpSync(join(REPO_ROOT, 'configs'), join(fixture.root, 'configs'), { recursive: true });
  cpSync(join(REPO_ROOT, '.prettierrc.json'), join(fixture.root, '.prettierrc.json'));
  cpSync(join(REPO_ROOT, '.prettierignore'), join(fixture.root, '.prettierignore'));
  return fixture;
}

beforeAll(async () => {
  registry = await startRegistry();
  repo = fixtureRepo();
  symlinkSync(join(REPO_ROOT, 'node_modules'), join(repo.root, 'node_modules'), 'junction');
  // workspace packages the apps depend on, as npm would report them
  for (const name of [
    '@beautinique/frontend-styles',
    '@beautinique/backend-server-kit',
    '@beautinique/shared-contracts',
    '@beautinique/shared-zod',
  ]) {
    const version = (
      JSON.parse(
        readFileSync(join(REPO_ROOT, 'node_modules', ...name.split('/'), 'package.json'), 'utf8'),
      ) as {
        version: string;
      }
    ).version;
    registry.versions.set(name, new Map([[version, { name, version }]]));
    registry.distTags.set(name, { latest: version });
  }
});
afterAll(async () => {
  await registry.close();
  repo.cleanup();
});

function run(file: string, args: string[], root = repo.root) {
  const child = spawn(process.execPath, [file, ...args], {
    cwd: root,
    env: {
      ...process.env,
      BEAUTINIQUE_ROOT: root,
      BEAUTINIQUE_REGISTRY: registry.url,
      NO_COLOR: '1',
      FORCE_COLOR: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  const collect = (chunk: Buffer) => {
    out += chunk.toString();
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  return new Promise<{ code: number | null; out: string }>((resolve) => {
    child.on('close', (code) => {
      resolve({ code, out });
    });
  });
}

const npmCli =
  process.env.npm_execpath ??
  join(process.execPath, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js');
const script = (name: string, workspace: string, root = repo.root) =>
  run(npmCli, ['run', name, '--workspace', workspace], root);

describe('frontend apps pass every check', () => {
  for (const [app, kind, built] of [
    ['seller', 'spa', 'dist/index.html'],
    ['delivery', 'pwa', 'dist/sw.js'],
    ['customer', 'ssr', 'build/server/index.js'],
  ] as const) {
    it(`${app} (${kind})`, async () => {
      const created = await run(BIN, ['--yes', '--skip-install', '--type', 'app', '--app', app]);
      expect(created.out).toContain(`Created frontend/${app}`);
      expect(created.code).toBe(0);

      const prettier = await run(
        join(REPO_ROOT, 'node_modules', 'prettier', 'bin', 'prettier.cjs'),
        ['--check', `frontend/${app}`],
      );
      expect(prettier.out).toContain('All matched files use Prettier code style');

      // the order CI uses: build first, then lint before typecheck (lint must not need typecheck's output)
      for (const step of ['build', 'lint', 'typecheck', 'test']) {
        const result = await script(step, app);
        expect(result.code, `${app} ${step}:\n${result.out}`).toBe(0);
      }
      expect(existsSync(join(repo.root, 'frontend', app, built))).toBe(true);
      // the build output must not trip the repo's format check (CI runs it after npm run build)
      const after = await run(join(REPO_ROOT, 'node_modules', 'prettier', 'bin', 'prettier.cjs'), [
        '--check',
        '.',
      ]);
      expect(after.out).toContain('All matched files use Prettier code style');
    });
  }

  it('refuses an app that is not one of the 11, and one that exists', async () => {
    const unknown = await run(BIN, ['--yes', '--skip-install', '--type', 'app', '--app', 'shop']);
    expect(unknown.code).toBe(1);
    expect(unknown.out).toContain('--app must be one of: customer, seller');
    const again = await run(BIN, ['--yes', '--skip-install', '--type', 'app', '--app', 'seller']);
    expect(again.code).toBe(1);
    expect(again.out).toContain('frontend/seller already exists.');
  });
});

describe('backend apps pass every check', () => {
  // The bundle imports the deployables by name, so this repo gets a node_modules of its own: a link
  // to every entry of this repo's, plus a link to each deployable (what npm install would add).
  let backend: ReturnType<typeof makeRepo>;
  const modules = () => join(backend.root, 'node_modules');
  const link = (deployable: string) => {
    symlinkSync(join(backend.root, 'backend', deployable), join(modules(), deployable), 'junction');
  };
  const create = (deployable: string) =>
    run(
      BIN,
      ['--yes', '--skip-install', '--type', 'backend', '--deployable', deployable],
      backend.root,
    );
  const check = async (workspace: string, steps: readonly string[]) => {
    for (const step of steps) {
      const result = await script(step, workspace, backend.root);
      expect(result.code, `${workspace} ${step}:\n${result.out}`).toBe(0);
    }
  };

  beforeAll(() => {
    backend = fixtureRepo();
    mkdirSync(modules());
    for (const entry of readdirSync(join(REPO_ROOT, 'node_modules'), { withFileTypes: true })) {
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        symlinkSync(
          join(REPO_ROOT, 'node_modules', entry.name),
          join(modules(), entry.name),
          'junction',
        );
      }
    }
  });
  afterAll(() => {
    backend.cleanup();
  });

  it('creates the gateway, services, core and the bundle, which keeps up with new deployables', async () => {
    const early = await create('bundle');
    expect(early.code).toBe(1);
    expect(early.out).toContain('create it first');

    for (const deployable of ['gateway', 'identity', 'core']) {
      const created = await create(deployable);
      expect(created.out).toContain(`Created backend/${deployable}`);
      expect(created.code).toBe(0);
      link(deployable);
    }
    expect((await create('bundle')).code).toBe(0);
    const registryFile = join(backend.root, 'backend', 'bundle', 'src', 'deployables.ts');
    expect(readFileSync(registryFile, 'utf8')).toContain(
      "names: readonly string[] = ['identity', 'core', 'gateway']",
    );

    const payments = await create('payments');
    expect(payments.out).toContain('Added payments to backend/bundle');
    link('payments');
    expect(readFileSync(registryFile, 'utf8')).toContain(
      "['identity', 'payments', 'core', 'gateway']",
    );
    const bundleManifest = JSON.parse(
      readFileSync(join(backend.root, 'backend', 'bundle', 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> };
    expect(Object.keys(bundleManifest.dependencies)).toEqual([
      '@beautinique/backend-server-kit',
      '@beautinique/shared-zod',
      'core',
      'gateway',
      'identity',
      'payments',
    ]);

    const prettier = await run(
      join(REPO_ROOT, 'node_modules', 'prettier', 'bin', 'prettier.cjs'),
      ['--check', 'backend'],
      backend.root,
    );
    expect(prettier.out).toContain('All matched files use Prettier code style');

    const again = await create('gateway');
    expect(again.out).toContain('backend/gateway already exists.');
    const unknown = await create('search');
    expect(unknown.out).toContain('--deployable must be one of: gateway, identity, payments');
  });

  for (const workspace of ['gateway', 'identity', 'core', 'bundle']) {
    it(`${workspace} passes build, lint, typecheck and test (CI order)`, async () => {
      await check(workspace, ['build', 'lint', 'typecheck', 'test']);
    });
  }

  it('the built bundle serves every deployable behind the gateway', async () => {
    await check('payments', ['build']);
    const child = spawn(process.execPath, ['--enable-source-maps', 'dist/start.js'], {
      cwd: join(backend.root, 'backend', 'bundle'),
      env: { ...process.env, PORT: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    try {
      const port = await new Promise<number>((resolve, reject) => {
        let out = '';
        child.stdout.on('data', (chunk: Buffer) => {
          out += chunk.toString();
          const line = out.split('\n').find((l) => l.includes('"bundle running"'));
          if (line) resolve((JSON.parse(line) as { port: number }).port);
        });
        child.stderr.on('data', (chunk: Buffer) => {
          out += chunk.toString();
        });
        child.on('exit', () => {
          reject(new Error(`bundle exited:\n${out}`));
        });
      });
      const ready = await fetch(`http://127.0.0.1:${String(port)}/ready`);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: { identity: 'ok', payments: 'ok', core: 'ok' },
      });
      const api = await fetch(`http://127.0.0.1:${String(port)}/api/v1/catalog/products/x`, {
        headers: { 'X-BQ-App': 'customer' },
      });
      expect(api.status).toBe(404);
    } finally {
      child.kill();
    }
  });
});
