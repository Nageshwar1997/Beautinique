import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Context } from './context.ts';
import {
  type ChangeKind,
  collectEntries,
  type DependencyChange,
  HELD,
  installedVersion,
  namesToCheck,
  planUpdates,
  readLockPackages,
  type UpdatePlan,
} from './dependencies.ts';
import { CancelledError } from './errors.ts';
import { install } from './npm.ts';
import { fetchPackages } from './registry.ts';
import { serializeManifest } from './release.ts';
import type { BumpType } from './versions.ts';
import { loadWorkspace, type PackageManifest } from './workspace.ts';

export interface UpdateDepsOptions {
  level: BumpType;
  dryRun: boolean;
  /** the Node.js version new dependencies must support (default: the running one) */
  node?: string;
}

const label = (where: string) => (where === '.' ? 'root' : where);
const KIND_TEXT: Record<ChangeKind, string> = {
  major: 'major',
  minor: 'minor',
  patch: 'patch',
  range: 'range only',
};
const plural = (n: number, word: string, words = `${word}s`) =>
  `${String(n)} ${n === 1 ? word : words}`;

export function printUpdatePlan(ctx: Context, plan: UpdatePlan, level: BumpType): void {
  ctx.log.heading(`Dependency updates (--level ${level})`);
  if (plan.changes.length > 0) {
    // One row per dependency and range change, with every package.json that has it
    // ("(peer)": only a peer there, "(+ peer)": a peer as well).
    const rows = new Map<string, { change: DependencyChange; where: Map<string, Set<string>> }>();
    for (const change of plan.changes) {
      const key = `${change.entry.name} ${change.entry.range} ${change.range}`;
      const row = rows.get(key) ?? { change, where: new Map<string, Set<string>>() };
      const fields = row.where.get(change.entry.where) ?? new Set<string>();
      row.where.set(change.entry.where, fields.add(change.entry.field));
      rows.set(key, row);
    }
    const whereText = (where: Map<string, Set<string>>) =>
      [...where]
        .map(([dir, fields]) => {
          const peer = fields.has('peerDependencies');
          return `${label(dir)}${peer ? (fields.size > 1 ? ' (+ peer)' : ' (peer)') : ''}`;
        })
        .join(', ');
    ctx.log.table(
      ['Dependency', 'From', 'To', 'Change', 'Where'],
      [...rows.values()].map(({ change, where }) => [
        change.entry.name,
        change.entry.range,
        change.range,
        KIND_TEXT[change.kind],
        whereText(where),
      ]),
    );
    const counts = (['major', 'minor', 'patch', 'range'] as const)
      .map((k) => [k, [...rows.values()].filter((r) => r.change.kind === k).length] as const)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${String(n)} ${KIND_TEXT[k]}`);
    ctx.log.blank();
    ctx.log.info(`${plural(rows.size, 'update')} (${counts.join(', ')}).`);
    if (plan.changes.some((c) => c.kind === 'range')) {
      ctx.log.dim('"range only": that version is installed already; package.json catches up.');
    }
  }
  if (plan.notes.length > 0) {
    ctx.log.blank();
    ctx.log.info('Left alone or held back:');
    for (const note of plan.notes) {
      ctx.log.dim(`  - ${note}`);
    }
  }
  if (plan.outsideLevel.length > 0) {
    ctx.log.blank();
    ctx.log.info(
      `Newer versions outside --level ${level}: ${plan.outsideLevel.join(', ')} (npm run update-deps takes them).`,
    );
  }
}

/** Installed versions (package-lock.json) that differ from the plan; empty when there is no lockfile. */
export function lockMismatches(root: string, changes: DependencyChange[]): string[] {
  const packages = readLockPackages(root);
  const found = new Set<string>();
  for (const { entry, to } of changes) {
    const installed = installedVersion(packages, entry.where, entry.name);
    if (installed !== undefined && installed !== to) {
      found.add(`${entry.name} in ${label(entry.where)}: ${installed} instead of ${to}`);
    }
  }
  return [...found];
}

/**
 * Writes the plan and installs it. First every changed line gets the exact version, so npm installs
 * exactly that one (a "^" range would let it take a newer minor even for --level patch); then the
 * ranges get their own style back, which the installed versions already fit, so npm keeps them. If npm
 * fails or the run is stopped, every package.json and package-lock.json goes back as it was.
 */
export async function applyUpdates(ctx: Context, plan: UpdatePlan): Promise<void> {
  const byFile = new Map<string, DependencyChange[]>();
  for (const change of plan.changes) {
    byFile.set(change.entry.file, [...(byFile.get(change.entry.file) ?? []), change]);
  }
  const lockfile = join(ctx.root, 'package-lock.json');
  const snapshot = new Map<string, string | null>(
    [...byFile.keys(), lockfile].map((file) => [
      file,
      existsSync(file) ? readFileSync(file, 'utf8') : null,
    ]),
  );
  const restore = () => {
    for (const [file, text] of snapshot) {
      if (text === null) {
        rmSync(file, { force: true });
      } else {
        writeFileSync(file, text);
      }
    }
  };
  const write = (value: (change: DependencyChange) => string) => {
    for (const [file, changes] of byFile) {
      const original = snapshot.get(file) ?? '';
      const manifest = JSON.parse(original) as PackageManifest;
      for (const change of changes) {
        const deps = manifest[change.entry.field];
        if (deps) {
          deps[change.entry.name] = value(change);
        }
      }
      writeFileSync(file, serializeManifest(original, manifest));
    }
  };
  const onSigint = () => {
    restore();
    process.stderr.write(
      '\nStopped. Every package.json and package-lock.json is back as it was; run npm install to put node_modules back in line.\n',
    );
    process.exit(130);
  };
  process.once('SIGINT', onSigint);
  try {
    write((change) => change.to);
    loadWorkspace(ctx); // the workspace rules still hold (a peer range equals its dev range)
    ctx.log.info('npm install with the exact new versions ...');
    await install(ctx);
    write((change) => change.range);
    ctx.log.info('npm install with the ranges in their own style ...');
    await install(ctx);
  } catch (error) {
    restore();
    ctx.log.warn(
      'Every package.json and package-lock.json is back as it was. If npm stopped halfway, run npm install.',
    );
    throw error;
  } finally {
    process.removeListener('SIGINT', onSigint);
  }

  const mismatches = lockMismatches(ctx.root, plan.changes);
  if (mismatches.length > 0) {
    ctx.log.warn(`npm installed other versions than planned:\n  - ${mismatches.join('\n  - ')}`);
  }
  const names = new Set(plan.changes.map((c) => c.entry.name));
  ctx.log.success(
    `Updated ${plural(names.size, 'dependency', 'dependencies')} in ${plural(byFile.size, 'package.json file')}.`,
  );
  ctx.log.info(
    'Next: npm run build, npm run lint, npm run typecheck and npm test (tests need npm run infra:up).',
  );
  if (plan.changes.some((c) => c.kind === 'major')) {
    ctx.log.info('Major updates can break things: read their release notes before you commit.');
  }
}

/** npm run update-deps: look up, show, ask, write, install. */
export async function updateDepsCommand(
  ctx: Context,
  options: UpdateDepsOptions,
): Promise<UpdatePlan> {
  const ws = loadWorkspace(ctx);
  const entries = collectEntries(ws);
  const internal = new Set(ws.byName.keys());
  const names = namesToCheck(entries, internal);
  ctx.log.info(
    `Looking up ${plural(names.length, 'dependency', 'dependencies')} on npm (held: ${[...HELD.keys()].join(', ')}) ...`,
  );
  const registry = await fetchPackages(ctx, names);
  const plan = planUpdates({
    entries,
    internal,
    registry,
    level: options.level,
    node: options.node ?? process.versions.node,
  });
  printUpdatePlan(ctx, plan, options.level);

  if (plan.changes.length === 0) {
    ctx.log.success(`Every dependency is up to date for --level ${options.level}.`);
    return plan;
  }
  if (options.dryRun) {
    ctx.log.info('Dry run: nothing was changed.');
    return plan;
  }
  const files = new Set(plan.changes.map((c) => c.entry.file));
  const go = await ctx.prompt.confirm(
    `Write these to ${plural(files.size, 'package.json file')} and run npm install?`,
    { default: true },
  );
  if (!go) {
    throw new CancelledError();
  }
  await applyUpdates(ctx, plan);
  return plan;
}
