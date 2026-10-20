import { CATEGORIES, type Context } from './context.ts';
import { CliError } from './errors.ts';
import {
  ALL_FIELDS,
  dependentsOf,
  internalDependencies,
  reexports,
  RUNTIME_FIELDS,
  topoSort,
} from './graph.ts';
import { fetchPackages, type RegistryPackage } from './registry.ts';
import type { Candidate } from './selection.ts';
import {
  bump,
  type BumpType,
  changeKind,
  dependentVersion,
  gt,
  highest,
  highestStable,
  isValid,
  npmSatisfies,
  prereleaseId,
  rewriteRange,
  satisfies,
  strongest,
  weaker,
} from './versions.ts';
import type { DependencyField, PackageManifest, Workspace, WorkspacePackage } from './workspace.ts';
import { publishablePackages } from './workspace.ts';

export type RegistryState = Map<string, RegistryPackage | null>;

export async function readRegistryState(ctx: Context, ws: Workspace): Promise<RegistryState> {
  return fetchPackages(
    ctx,
    publishablePackages(ws).map((p) => p.name),
  );
}

export type PackageStatus = 'new' | 'pending' | 'published' | 'behind';

/**
 * Where a public package stands compared to npm:
 * - new: never published;
 * - published: npm has the local version and nothing newer (a stable local is compared with stable npm versions);
 * - behind: npm has something newer than the local copy (pull before releasing);
 * - pending: the local version is newer than npm (waiting to be published).
 */
export function statusOf(
  pkg: WorkspacePackage,
  info: RegistryPackage | null | undefined,
): PackageStatus {
  if (!info || info.versions.length === 0) {
    return 'new';
  }
  const isPre = prereleaseId(pkg.version) !== null;
  const newest = isPre ? highest(info.versions) : highestStable(info.versions);
  if (newest !== null && gt(newest, pkg.version)) {
    return 'behind';
  }
  return info.versions.includes(pkg.version) ? 'published' : 'pending';
}

const npmNote = (info: RegistryPackage | null | undefined) =>
  info ? `npm ${info.distTags.latest ?? highest(info.versions) ?? '-'}` : 'not on npm';

/** `npm run publish`: packages whose local version is not on npm yet. */
export function publishCandidates(ws: Workspace, registry: RegistryState): Candidate[] {
  return publishablePackages(ws).map((pkg) => {
    const info = registry.get(pkg.name);
    const status = statusOf(pkg, info);
    const note = `${pkg.version} (${npmNote(info)})`;
    switch (status) {
      case 'new':
        return { pkg, blocked: null, note: `${pkg.version} (new)` };
      case 'pending':
        return { pkg, blocked: null, note };
      case 'published':
        return {
          pkg,
          blocked: `${pkg.version} is already on npm (use npm run republish to release a new version)`,
          note,
        };
      case 'behind':
        return {
          pkg,
          blocked: `local ${pkg.version} is behind ${npmNote(info)}; pull the latest code`,
          note,
        };
    }
  });
}

/** `npm run republish`: packages that are on npm at exactly the local version, with nothing newer. */
export function republishCandidates(ws: Workspace, registry: RegistryState): Candidate[] {
  return publishablePackages(ws).map((pkg) => {
    const info = registry.get(pkg.name);
    const status = statusOf(pkg, info);
    const note = `${pkg.version} (${npmNote(info)})`;
    switch (status) {
      case 'published':
        return { pkg, blocked: null, note };
      case 'new':
        return { pkg, blocked: 'never published; use npm run publish first', note };
      case 'pending':
        return {
          pkg,
          blocked: `${pkg.version} is waiting to be published; run npm run publish`,
          note,
        };
      case 'behind':
        return {
          pkg,
          blocked: `local ${pkg.version} is behind ${npmNote(info)}; pull the latest code`,
          note,
        };
    }
  });
}

/** Version bumps: one type for all, or a choice per package (patch / minor / major / custom). */
export async function chooseVersions(
  ctx: Context,
  selected: WorkspacePackage[],
  flagBump: BumpType | null,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  let same: BumpType | null = flagBump;
  if (same === null) {
    const example = selected[0];
    const mode = await ctx.prompt.select<'same' | 'each'>('How should the versions be bumped?', [
      {
        name: 'Same bump for all',
        value: 'same',
        description: 'patch, minor or major for every selected package',
      },
      {
        name: 'Choose for each package',
        value: 'each',
        description: 'also allows a custom version',
      },
    ]);
    if (mode === 'same') {
      const describe = (kind: BumpType) =>
        example ? `${example.version} -> ${bump(example.version, kind)}` : undefined;
      same = await ctx.prompt.select<BumpType>('Bump type for all', [
        { name: 'patch  (fixes)', value: 'patch', description: describe('patch') },
        {
          name: 'minor  (new features, no breaking change)',
          value: 'minor',
          description: describe('minor'),
        },
        { name: 'major  (breaking change)', value: 'major', description: describe('major') },
      ]);
    }
  }
  for (const pkg of selected) {
    if (same !== null) {
      result.set(pkg.name, bump(pkg.version, same));
      continue;
    }
    const choice = await ctx.prompt.select<BumpType | 'custom'>(`${pkg.name} (${pkg.version})`, [
      { name: `patch  ${bump(pkg.version, 'patch')}`, value: 'patch' },
      { name: `minor  ${bump(pkg.version, 'minor')}`, value: 'minor' },
      { name: `major  ${bump(pkg.version, 'major')}`, value: 'major' },
      { name: 'custom (e.g. a prerelease 2.0.0-beta.0)', value: 'custom' },
    ]);
    if (choice === 'custom') {
      const version = await ctx.prompt.input(`New version for ${pkg.name}`, {
        validate: (v) => {
          const value = v.trim();
          if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(value) || !isValid(value)) {
            return 'Use a version like 2.0.0 or 2.0.0-beta.0 (no leading zeros)';
          }
          return gt(value, pkg.version) ? true : `Must be higher than ${pkg.version}`;
        },
      });
      result.set(pkg.name, version.trim());
    } else {
      result.set(pkg.name, bump(pkg.version, choice));
    }
  }
  return result;
}

export type Reason = 'selected' | 'dependent' | 'pending' | 'new';

export interface ReleaseItem {
  pkg: WorkspacePackage;
  from: string;
  to: string;
  reason: Reason;
  /** npm dist-tag: "latest", or the prerelease id */
  tag: string;
}

export interface RangeChange {
  pkg: WorkspacePackage;
  field: DependencyField;
  dep: string;
  from: string;
  to: string;
}

export interface ReleasePlan {
  /** dependencies first */
  items: ReleaseItem[];
  rangeChanges: RangeChange[];
  /** new package.json contents, for every workspace whose file changes */
  manifests: Map<string, PackageManifest>;
  warnings: string[];
}

export type CascadePolicy = 'ask' | 'yes' | 'no';

const distTag = (version: string) => prereleaseId(version) ?? 'latest';

/**
 * The smallest bump a dependent needs when one of its dependencies changes from -> to:
 * - a peer dependency range that breaks is breaking for the dependent's users: major;
 * - a breaking (major) change of a dependency the dependent re-exports is breaking too: major;
 * - otherwise: patch.
 */
function requiredBump(
  dependent: WorkspacePackage,
  field: DependencyField,
  dep: string,
  change: BumpType,
): BumpType {
  if (field === 'peerDependencies') {
    return 'major';
  }
  return change === 'major' && reexports(dependent, dep) ? 'major' : 'patch';
}

const why = (bumpKind: BumpType, field: DependencyField) =>
  bumpKind === 'major'
    ? field === 'peerDependencies'
      ? ' (peer dependency)'
      : ' (re-exports it)'
    : '';

/**
 * Republish plan: bumps the selected packages, pulls in published dependents whose ranges break (ask / yes /
 * no) with the bump they need, rewrites internal ranges everywhere they must change, and checks that every
 * version is new and every published package can be installed from npm afterwards.
 */
export async function planRepublish(
  ctx: Context,
  ws: Workspace,
  registry: RegistryState,
  versions: Map<string, string>,
  cascade: CascadePolicy,
): Promise<ReleasePlan> {
  const next = new Map(versions);
  const reasons = new Map<string, Reason>([...versions.keys()].map((n) => [n, 'selected']));
  const warnings: string[] = [];
  const declined = new Set<string>();
  const asked = new Set<string>();

  for (let changed = true; changed;) {
    changed = false;
    for (const [name, to] of [...next]) {
      const from = ws.byName.get(name)?.version ?? to;
      const change = changeKind(from, to);
      const preid = prereleaseId(to);
      for (const edge of dependentsOf(name, ws)) {
        const target = edge.pkg;
        const key = `${target.name}>${name}`;
        if (edge.field === 'devDependencies' || !target.publishable || declined.has(key)) {
          continue;
        }
        if (satisfies(to, edge.range)) {
          continue;
        }
        const needed = requiredBump(target, edge.field, name, change);
        const planned = next.get(target.name);

        if (planned !== undefined) {
          // already in the release: make sure its bump is big enough
          const plannedKind = changeKind(target.version, planned);
          if (!weaker(plannedKind, needed) || asked.has(key)) {
            continue;
          }
          const raised = dependentVersion(target.version, strongest(plannedKind, needed), preid);
          let raise = reasons.get(target.name) === 'dependent' || cascade === 'yes';
          if (!raise && cascade === 'ask') {
            asked.add(key);
            raise = await ctx.prompt.confirm(
              `${target.name} is set to ${planned} (${plannedKind}), but ${name} ${to} needs a ${needed} ` +
                `bump${why(needed, edge.field)}. Use ${raised} instead?`,
              { default: true },
            );
          }
          if (raise) {
            next.set(target.name, raised);
            changed = true;
          } else {
            asked.add(key);
            warnings.push(
              `${target.name} ${planned} is a smaller bump than ${name} ${to} needs (${needed}).`,
            );
          }
          continue;
        }

        if (statusOf(target, registry.get(target.name)) !== 'published') {
          // not on npm at this version yet: its range is simply rewritten before its first publish
          continue;
        }
        const nextVersion = dependentVersion(target.version, needed, preid);
        let include = cascade === 'yes';
        if (cascade === 'ask') {
          include = await ctx.prompt.confirm(
            `${target.name} needs ${name} "${edge.range}", which does not allow ${to}. ` +
              `Add ${target.name} to this release as ${nextVersion} (${needed}${why(needed, edge.field)})?`,
            { default: true },
          );
        }
        if (include) {
          next.set(target.name, nextVersion);
          reasons.set(target.name, 'dependent');
          changed = true;
        } else {
          declined.add(key);
          warnings.push(
            `${target.name} keeps ${name} "${edge.range}"; it will install ${name} from npm, not this workspace.`,
          );
        }
      }
    }
  }

  // A version that npm already has can never be published again.
  const taken = [...next].filter(
    ([name, to]) => registry.get(name)?.versions.includes(to) === true,
  );
  if (taken.length > 0) {
    throw new CliError(
      `These versions are already on npm: ${taken.map(([n, v]) => `${n}@${v}`).join(', ')}.`,
      {
        code: 'VERSION_TAKEN',
        hint: 'Pull the latest code (npm has newer releases), then republish. Nothing was changed.',
      },
    );
  }

  const items: ReleaseItem[] = [...next].map(([name, to]) => {
    const pkg = ws.byName.get(name);
    if (!pkg) {
      throw new Error(`Unknown package ${name}`);
    }
    return {
      pkg,
      from: pkg.version,
      to,
      reason: reasons.get(name) ?? 'selected',
      tag: distTag(to),
    };
  });

  const { rangeChanges, manifests } = rewriteRanges(ws, next, declined);
  const plan = finalize(ws, items, rangeChanges, manifests, warnings);
  await assertInstallable(ctx, ws, registry, plan);
  return plan;
}

/** Publish plan for versions already in package.json (new or pending). */
export async function planPublish(
  ctx: Context,
  ws: Workspace,
  registry: RegistryState,
  selected: WorkspacePackage[],
): Promise<ReleasePlan> {
  const items: ReleaseItem[] = selected.map((pkg) => ({
    pkg,
    from: pkg.version,
    to: pkg.version,
    reason: statusOf(pkg, registry.get(pkg.name)) === 'new' ? 'new' : 'pending',
    tag: distTag(pkg.version),
  }));
  const plan = finalize(ws, items, [], new Map(), []);
  await assertInstallable(ctx, ws, registry, plan);
  return plan;
}

/**
 * New ranges: a dependency whose version changes gets its range moved when the range breaks. A released
 * dependent also gets its dependency floors raised (its consumers get the tested combination), except
 * peer ranges that still match: raising those would force consumers to upgrade (npm ERESOLVE).
 * Ranges that are not plain versions (workspace:, file:, *, complex) are never touched.
 */
function rewriteRanges(ws: Workspace, next: Map<string, string>, declined: Set<string>) {
  const rangeChanges: RangeChange[] = [];
  const manifests = new Map<string, PackageManifest>();
  for (const pkg of ws.packages) {
    const released = next.has(pkg.name);
    let manifest: PackageManifest | null = released ? structuredClone(pkg.manifest) : null;
    if (manifest) {
      manifest.version = next.get(pkg.name) ?? pkg.version;
    }
    for (const dep of internalDependencies(pkg, ws, ALL_FIELDS)) {
      const to = next.get(dep.name);
      if (to === undefined || declined.has(`${pkg.name}>${dep.name}`)) {
        continue;
      }
      const stillMatches = satisfies(to, dep.range);
      if (stillMatches && (!released || dep.field === 'peerDependencies')) {
        continue;
      }
      const range = rewriteRange(dep.range, to);
      if (range === null || range === dep.range) {
        continue;
      }
      manifest ??= structuredClone(pkg.manifest);
      const field = manifest[dep.field] ?? {};
      field[dep.name] = range;
      manifest[dep.field] = field;
      rangeChanges.push({ pkg, field: dep.field, dep: dep.name, from: dep.range, to: range });
    }
    if (manifest) {
      manifests.set(pkg.name, manifest);
    }
  }
  return { rangeChanges, manifests };
}

function finalize(
  ws: Workspace,
  items: ReleaseItem[],
  rangeChanges: RangeChange[],
  manifests: Map<string, PackageManifest>,
  warnings: string[],
): ReleasePlan {
  // readable order for packages that do not depend on each other: shared, frontend, backend, then name
  const rank = (i: ReleaseItem) =>
    i.pkg.category ? CATEGORIES.indexOf(i.pkg.category) : CATEGORIES.length;
  const sorted = [...items].sort(
    (a, b) => rank(a) - rank(b) || a.pkg.folder.localeCompare(b.pkg.folder),
  );
  const order = topoSort(
    sorted.map((i) => i.pkg.name),
    ws,
  );
  const byName = new Map(items.map((i) => [i.pkg.name, i]));
  return {
    items: order.map((n) => byName.get(n)).filter((i): i is ReleaseItem => i !== undefined),
    rangeChanges,
    manifests,
    warnings,
  };
}

/**
 * Every published package must be installable from npm: each runtime @beautinique dependency range
 * must match (the way npm matches: prereleases only when the range names one) a version in this release
 * or one already on npm, and must not point at a private package. Checked on the final package.json
 * contents, before anything is written.
 */
export async function assertInstallable(
  ctx: Context,
  ws: Workspace,
  registry: RegistryState,
  plan: ReleasePlan,
): Promise<void> {
  const releasing = new Map(plan.items.map((i) => [i.pkg.name, i.to]));
  const edges = plan.items.flatMap((item) => {
    const manifest = plan.manifests.get(item.pkg.name) ?? item.pkg.manifest;
    return RUNTIME_FIELDS.flatMap((field) =>
      Object.entries(manifest[field] ?? {})
        .filter(([dep]) => ws.byName.has(dep))
        .map(([dep, range]) => ({ item, field, dep, range })),
    );
  });

  // registry state normally covers every publishable package; this only guards a stale map
  const missing = [...new Set(edges.map((e) => e.dep))].filter(
    (dep) => !registry.has(dep) && ws.byName.get(dep)?.publishable === true,
  );
  if (missing.length > 0) {
    for (const [name, info] of await fetchPackages(ctx, missing)) {
      registry.set(name, info);
    }
  }

  const problems: string[] = [];
  for (const { item, field, dep, range } of edges) {
    if (ws.byName.get(dep)?.publishable !== true) {
      problems.push(
        `${item.pkg.name} (${field}) depends on ${dep}, which is not published to npm (private).`,
      );
      continue;
    }
    const releasedAs = releasing.get(dep);
    if (releasedAs !== undefined && npmSatisfies(releasedAs, range)) {
      continue;
    }
    const onNpm = registry.get(dep)?.versions ?? [];
    if (!onNpm.some((v) => npmSatisfies(v, range))) {
      problems.push(
        `${item.pkg.name} needs ${dep} "${range}", but npm would find no matching version (on npm or in this release). ` +
          `Release ${dep} too.`,
      );
    }
  }
  if (problems.length > 0) {
    throw new CliError(
      `This release would publish packages that cannot be installed:\n  - ${problems.join('\n  - ')}`,
      {
        code: 'NOT_INSTALLABLE',
        hint: 'Nothing was changed.',
      },
    );
  }
}
