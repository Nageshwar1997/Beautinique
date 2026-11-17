import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import type { Context } from '../context.ts';
import { CliError } from '../errors.ts';
import { formatFile } from '../format.ts';
import { install } from '../npm.ts';
import { fetchPackage } from '../registry.ts';
import { verifyPackages } from '../verify.ts';
import { highest } from '../versions.ts';
import { loadWorkspace, type Workspace, type WorkspacePackage } from '../workspace.ts';

const FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

/**
 * Version ranges for the libraries a new app or package needs. The repo uses one version of each
 * library everywhere, so a library already used anywhere (root package.json or any workspace) keeps
 * that range; a new one gets `^<latest>` from npm.
 */
export async function resolveVersions(
  ctx: Context,
  ws: Workspace,
  names: readonly string[],
): Promise<Record<string, string>> {
  const known = new Map<string, string>();
  const root = JSON.parse(readFileSync(join(ctx.root, 'package.json'), 'utf8')) as Record<
    string,
    Record<string, string> | undefined
  >;
  for (const manifest of [root, ...ws.packages.map((p) => p.manifest as unknown as typeof root)]) {
    for (const field of FIELDS) {
      for (const [name, range] of Object.entries(manifest[field] ?? {})) {
        if (!known.has(name) && !range.startsWith('workspace:') && !range.startsWith('file:')) {
          known.set(name, range);
        }
      }
    }
  }
  const result: Record<string, string> = {};
  for (const name of names) {
    const workspacePackage = ws.byName.get(name);
    if (workspacePackage) {
      result[name] = `^${workspacePackage.version}`;
      continue;
    }
    const range = known.get(name);
    if (range) {
      result[name] = range;
      continue;
    }
    const info = await fetchPackage(ctx, name);
    const latest = info ? (info.distTags.latest ?? highest(info.versions)) : null;
    if (!latest) {
      throw new CliError(`Could not find ${name} on npm.`, { code: 'UNKNOWN_DEPENDENCY' });
    }
    result[name] = `^${latest}`;
  }
  return result;
}

/** The ranges of `names` from resolveVersions, sorted by name (a package.json dependency block). */
export const pickVersions = (versions: Record<string, string>, names: readonly string[]) =>
  Object.fromEntries(
    names.toSorted().map((name) => {
      const range = versions[name];
      if (!range) throw new Error(`No version for ${name}`);
      return [name, range];
    }),
  );

/** Writes all files into a temporary folder, then renames it: never a half-created folder. */
export async function writeTree(
  ctx: Context,
  relDir: string,
  files: ReadonlyMap<string, string>,
): Promise<string> {
  const target = join(ctx.root, relDir);
  if (existsSync(target)) {
    throw new CliError(`${relDir} already exists.`, { code: 'EXISTS' });
  }
  const temp = join(dirname(target), `.${basename(target)}.creating`);
  rmSync(temp, { recursive: true, force: true });
  try {
    for (const [file, content] of files) {
      const path = join(temp, file);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, await formatFile(join(target, file), content));
    }
    mkdirSync(dirname(target), { recursive: true });
    renameSync(temp, target);
  } catch (error) {
    rmSync(temp, { recursive: true, force: true });
    throw error;
  }
  ctx.log.success(`Created ${relDir}`);
  return target;
}

export interface InstallOptions {
  /** puts back other files the generator changed, when npm install fails */
  rollback?: () => void;
  /** other workspaces whose checks run too (they depend on the new one) */
  verifyAlso?: readonly string[];
}

/**
 * Links the new workspace (npm install) and runs its checks (build, typecheck, lint, test). If npm
 * fails, the folder and the lockfile are put back.
 */
export async function installAndCheck(
  ctx: Context,
  target: string,
  relDir: string,
  name: string,
  options: InstallOptions = {},
): Promise<WorkspacePackage> {
  const lockfile = join(ctx.root, 'package-lock.json');
  const lockBefore = existsSync(lockfile) ? readFileSync(lockfile, 'utf8') : null;
  try {
    await install(ctx);
  } catch (error) {
    rmSync(target, { recursive: true, force: true });
    options.rollback?.();
    if (lockBefore !== null) {
      writeFileSync(lockfile, lockBefore);
    }
    ctx.log.warn(`Removed ${relDir} again because npm install failed.`);
    throw error;
  }
  const ws = loadWorkspace(ctx);
  const created = ws.byName.get(name);
  if (!created) {
    throw new Error(`${name} was created but is not in the workspace`);
  }
  const also = (options.verifyAlso ?? []).flatMap((other) => ws.byName.get(other) ?? []);
  await verifyPackages(ctx, [created, ...also]);
  return created;
}
