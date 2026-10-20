import type { CommonFlags } from './args.ts';
import type { Context } from './context.ts';
import { CancelledError, CliError } from './errors.ts';
import {
  headCommit,
  requireCleanTree,
  requireIdentity,
  requireReleaseBranch,
  tagCommit,
} from './git.ts';
import { buildOrder, internalClosure } from './graph.ts';
import { requireLogin, runScript } from './npm.ts';
import {
  chooseVersions,
  planPublish,
  planRepublish,
  publishCandidates,
  readRegistryState,
  republishCandidates,
  statusOf,
} from './plan.ts';
import { printPlan, type ReleaseOutcome, runRelease, type Target } from './release.ts';
import { type Candidate, selectPackages } from './selection.ts';
import { buildPackages, verifyPackages } from './verify.ts';
import { loadWorkspace, type Workspace, type WorkspacePackage } from './workspace.ts';

/** Asks before anything is written; a dry run only says what it will do. */
async function confirmGo(ctx: Context, message: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    ctx.log.info('Dry run: checks and `npm publish --dry-run` only.');
    return;
  }
  if (!(await ctx.prompt.confirm(message, { default: false }))) {
    throw new CancelledError();
  }
}

/** Laptop releases: committed code on the release branch, a git identity for the commit, an npm login. */
async function preflight(ctx: Context): Promise<void> {
  await requireCleanTree(ctx);
  await requireReleaseBranch(ctx);
  await requireIdentity(ctx);
  await requireLogin(ctx);
}

const packages = (ws: Workspace, names: string[]): WorkspacePackage[] =>
  names.flatMap((n) => {
    const pkg = ws.byName.get(n);
    return pkg ? [pkg] : [];
  });

/**
 * GitHub release job: publish exactly what the laptop prepared. Every waiting version must have its
 * release tag on the commit being built (no unreviewed commits slip in), and brand-new packages are
 * refused (npm can only trust a package that exists).
 */
async function ciSelection(
  ctx: Context,
  candidates: Candidate[],
  isNew: (pkg: WorkspacePackage) => boolean,
): Promise<WorkspacePackage[]> {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    throw new CliError('--ci is only for the GitHub Release workflow.', {
      code: 'BAD_FLAGS',
      hint: 'On the laptop use npm run publish (or republish --target github).',
    });
  }
  const pending = candidates.filter((c) => c.blocked === null).map((c) => c.pkg);
  const brandNew = pending.filter(isNew);
  if (brandNew.length > 0) {
    throw new CliError(
      `New packages cannot be published by GitHub Actions: ${brandNew.map((p) => p.name).join(', ')}.`,
      {
        code: 'NEW_IN_CI',
        hint: 'Publish them once from the laptop (npm run publish); later versions can use the workflow.',
      },
    );
  }
  const head = await headCommit(ctx);
  const untagged: string[] = [];
  for (const pkg of pending) {
    const tag = `${pkg.name}@${pkg.version}`;
    if ((await tagCommit(ctx, tag)) !== head) {
      untagged.push(tag);
    }
  }
  if (untagged.length > 0) {
    throw new CliError(
      `These versions are not tagged on the commit being built: ${untagged.join(', ')}.`,
      {
        code: 'UNTAGGED_RELEASE',
        hint: 'Prepare releases with npm run republish -- --target github, push with --follow-tags, and run the workflow on that commit.',
      },
    );
  }
  return pending;
}

/**
 * npm run publish: packages whose package.json version is not on npm yet (new packages, or versions a
 * republish prepared). With --ci (GitHub Release workflow) it checks and packs them for the publish job.
 */
export async function publishCommand(ctx: Context, flags: CommonFlags): Promise<ReleaseOutcome> {
  const ws = loadWorkspace(ctx);
  if (!flags.ci && !flags.dryRun) {
    await preflight(ctx);
  }
  const registry = await readRegistryState(ctx, ws);
  const candidates = publishCandidates(ws, registry);

  let selected: WorkspacePackage[];
  if (flags.ci) {
    selected = await ciSelection(
      ctx,
      candidates,
      (pkg) => statusOf(pkg, registry.get(pkg.name)) === 'new',
    );
    if (selected.length === 0) {
      ctx.log.success('Nothing to publish: every package version is already on npm.');
      return { results: new Map(), committed: false, tags: [] };
    }
  } else {
    selected = await selectPackages(ctx, candidates, flags, 'publish');
  }

  const plan = await planPublish(ctx, ws, registry, selected);
  const target: Target = flags.ci ? 'ci' : 'laptop';
  printPlan(ctx, plan, target);
  if (!flags.ci) {
    await confirmGo(
      ctx,
      `Publish ${String(plan.items.length)} package(s) to npm now?`,
      flags.dryRun,
    );
  }
  return runRelease(ctx, ws, plan, { target, dryRun: flags.dryRun, packDir: flags.packDir });
}

/** npm run republish: bump published packages (and dependents that need it), then publish or prepare for GitHub. */
export async function republishCommand(ctx: Context, flags: CommonFlags): Promise<ReleaseOutcome> {
  if (flags.ci) {
    throw new CliError(
      'republish does not run in CI; republish on the laptop with --target github.',
      { code: 'BAD_FLAGS' },
    );
  }
  const ws = loadWorkspace(ctx);
  if (!flags.dryRun) {
    await preflight(ctx);
  }
  const registry = await readRegistryState(ctx, ws);
  const selected = await selectPackages(ctx, republishCandidates(ws, registry), flags, 'republish');
  const versions = await chooseVersions(ctx, selected, flags.bump);
  const plan = await planRepublish(ctx, ws, registry, versions, flags.cascade);

  const target: Target =
    flags.target ??
    (await ctx.prompt.select<Target>('Where should it be published from?', [
      {
        name: 'This laptop, now',
        value: 'laptop',
        description: 'npm asks for 2FA for each package',
      },
      {
        name: 'GitHub Actions (with provenance)',
        value: 'github',
        description:
          'prepare here (versions, changelogs, commit, tags); push and run the Release workflow',
      },
    ]));
  printPlan(ctx, plan, target);
  await confirmGo(
    ctx,
    target === 'github'
      ? 'Write the versions and prepare the GitHub release?'
      : `Publish ${String(plan.items.length)} package(s) to npm now?`,
    flags.dryRun,
  );
  return runRelease(ctx, ws, plan, { target, dryRun: flags.dryRun });
}

/**
 * npm run verify: every check a publish runs (build, typecheck, lint, test, package contents), nothing
 * published. Internal dependencies are built first, so it works on a fresh clone.
 */
export async function verifyCommand(ctx: Context, flags: CommonFlags): Promise<void> {
  const ws = loadWorkspace(ctx);
  const candidates: Candidate[] = ws.packages
    .filter((p) => p.category !== null)
    .map((pkg) => ({ pkg, blocked: null, note: pkg.version }));
  const selected = await selectPackages(ctx, candidates, flags, 'verify');
  const names = selected.map((p) => p.name);
  await buildPackages(ctx, packages(ws, buildOrder(internalClosure(names, ws), ws)));
  const order = buildOrder(names, ws);
  await verifyPackages(ctx, packages(ws, order));
  ctx.log.blank();
  ctx.log.success(`${String(order.length)} package(s) are ready to publish.`);
}

/** npm run build: every workspace with a build script, dependencies (devDependencies too) first. */
export async function buildCommand(ctx: Context): Promise<void> {
  const ws = loadWorkspace(ctx);
  let built = 0;
  for (const pkg of packages(
    ws,
    buildOrder(
      ws.packages.map((p) => p.name),
      ws,
    ),
  )) {
    const result = await runScript(ctx, pkg, 'build');
    if (!result.ran) {
      continue;
    }
    if (!result.ok) {
      ctx.log.error(`${pkg.name}: build failed`);
      ctx.log.info(result.output);
      throw new CliError(`Build failed: ${pkg.name}`, { code: 'BUILD_FAILED' });
    }
    built += 1;
    ctx.log.success(`built ${pkg.name}`);
  }
  ctx.log.success(`${String(built)} package(s) built.`);
}
