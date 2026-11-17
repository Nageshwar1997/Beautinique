import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  type Deployable,
  DEPLOYABLES,
} from '../../../../packages/shared/contracts/src/platform.ts';
import type { Context } from '../context.ts';
import { CancelledError, CliError } from '../errors.ts';
import { formatFile } from '../format.ts';
import { loadWorkspace } from '../workspace.ts';
import {
  BACKEND_KIND,
  BACKEND_KIND_LABELS,
  BACKEND_TARGETS,
  backendLibraries,
  type BackendSpec,
  type BackendTarget,
  bundleRegistry,
  deployablePort,
  envPrefix,
  renderBackend,
} from './backend-templates.ts';
import { installAndCheck, resolveVersions, writeTree } from './scaffold.ts';

export interface CreateBackendFlags {
  deployable?: string;
  /** write files only: no npm install and no checks (tests) */
  skipInstall?: boolean;
}

const isDeployable = (target: BackendTarget): target is Deployable => target !== 'bundle';

/**
 * Adds a new deployable to backend/bundle (its dependency and src/deployables.ts). Returns a function
 * that puts both files back.
 */
async function addToBundle(
  ctx: Context,
  deployable: Deployable,
  deployables: readonly Deployable[],
): Promise<() => void> {
  const manifestPath = join(ctx.root, 'backend', 'bundle', 'package.json');
  const registryPath = join(ctx.root, 'backend', 'bundle', 'src', 'deployables.ts');
  const before = [manifestPath, registryPath].map((path) => [path, readFileSync(path, 'utf8')]);
  const manifest = JSON.parse(before[0]?.[1] ?? '{}') as { dependencies?: Record<string, string> };
  manifest.dependencies = Object.fromEntries(
    Object.entries({ ...manifest.dependencies, [deployable]: '^0.0.0' }).toSorted(([a], [b]) =>
      a.localeCompare(b),
    ),
  );
  writeFileSync(
    manifestPath,
    await formatFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`),
  );
  writeFileSync(registryPath, await formatFile(registryPath, bundleRegistry(deployables)));
  ctx.log.success(`Added ${deployable} to backend/bundle`);
  return () => {
    for (const [path, content] of before) {
      if (path !== undefined && content !== undefined) {
        writeFileSync(path, content);
      }
    }
  };
}

/**
 * Creates backend/<name>: one of the 5 deployables (DEPLOYABLES in shared-contracts), or the bundle
 * that runs them in one process. New business features are Core modules, not new deployables.
 */
export async function createBackendApp(ctx: Context, flags: CreateBackendFlags): Promise<string> {
  const ws = loadWorkspace(ctx);
  const exists = (target: BackendTarget) =>
    existsSync(join(ctx.root, 'backend', target)) || ws.byName.has(target);
  const blocked = (target: BackendTarget): string | false => {
    if (exists(target)) return 'already exists';
    if (target === 'bundle' && !exists('gateway')) return 'create the gateway first';
    return false;
  };

  ctx.log.heading('New backend app');
  let target: BackendTarget;
  if (flags.deployable !== undefined) {
    if (!(BACKEND_TARGETS as readonly string[]).includes(flags.deployable)) {
      throw new CliError(`--deployable must be one of: ${BACKEND_TARGETS.join(', ')}.`, {
        code: 'BAD_FLAGS',
        hint: 'A new business feature is a Core module (ARCHITECTURE §4), not a new deployable.',
      });
    }
    target = flags.deployable as BackendTarget;
    if (exists(target)) {
      throw new CliError(`backend/${target} already exists.`, { code: 'EXISTS' });
    }
    if (blocked(target)) {
      throw new CliError('The bundle runs the gateway in front of the others: create it first.', {
        code: 'NEEDS_GATEWAY',
        hint: 'npm run create -- --type backend --deployable gateway',
      });
    }
  } else {
    if (BACKEND_TARGETS.every((t) => exists(t))) {
      throw new CliError('Every deployable and the bundle already exist.', {
        code: 'NOTHING_TO_CREATE',
      });
    }
    target = await ctx.prompt.select<BackendTarget>(
      'Which backend app?',
      BACKEND_TARGETS.map((t) => ({
        name: `${t.padEnd(9)} ${BACKEND_KIND_LABELS[BACKEND_KIND[t]]}`,
        value: t,
        disabled: blocked(t),
      })),
    );
  }

  const present = DEPLOYABLES.filter((d) => exists(d));
  const inBundle = isDeployable(target) && exists('bundle');
  const libs = backendLibraries(target, present);
  const versions = await resolveVersions(ctx, ws, [...libs.dependencies, ...libs.devDependencies]);
  const spec: BackendSpec = { target, versions, deployables: present };
  const relDir = `backend/${target}`;
  const files = renderBackend(spec);

  ctx.log.heading('Summary');
  ctx.log.table(
    ['', ''],
    [
      ['Name', target],
      ['Folder', relDir],
      ['Kind', BACKEND_KIND_LABELS[BACKEND_KIND[target]]],
      isDeployable(target)
        ? ['Port', `${String(deployablePort(target))} (settings: ${envPrefix(target)}__*)`]
        : ['Runs', `${present.join(', ')} (gateway on PORT, the rest on free 127.0.0.1 ports)`],
      ...(inBundle ? [['Also', `adds ${target} to backend/bundle`]] : []),
      ['Files', [...files.keys()].join(', ')],
    ],
  );
  if (!(await ctx.prompt.confirm('Create it?', { default: true }))) {
    throw new CancelledError();
  }

  const dir = await writeTree(ctx, relDir, files);
  const restoreBundle =
    inBundle && isDeployable(target) ? await addToBundle(ctx, target, [...present, target]) : null;
  if (flags.skipInstall) {
    return dir;
  }
  await installAndCheck(ctx, dir, relDir, target, {
    ...(restoreBundle ? { rollback: restoreBundle, verifyAlso: ['bundle'] } : {}),
  });

  ctx.log.heading('Next steps');
  if (target === 'bundle') {
    ctx.log.info("1. Copy backend/bundle/.env.example to .env and add each deployable's keys.");
    ctx.log.info('2. npm run dev:backend  -> http://localhost:8080/ready');
  } else {
    const where =
      target === 'gateway'
        ? 'src/manifest.ts (routes come from shared-contracts)'
        : target === 'core'
          ? 'src/modules/<module>/ (mount it in src/modules/index.ts)'
          : 'src/routes/index.ts';
    ctx.log.info(`1. Copy ${relDir}/.env.example to .env (never commit .env).`);
    ctx.log.info(
      `2. npm run dev --workspace ${target}  -> http://localhost:${String(deployablePort(target))}/health`,
    );
    ctx.log.info(`3. Add routes in ${relDir}/${where}.`);
  }
  ctx.log.info(
    `${target === 'bundle' ? '3' : '4'}. Commit it (Conventional Commits, e.g. "feat(${target}): ...").`,
  );
  return dir;
}
