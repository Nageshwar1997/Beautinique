import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { styleText } from 'node:util';

import { buildChangelogs } from './changelog.ts';
import type { Context } from './context.ts';
import { CancelledError, CliError } from './errors.ts';
import { commit, createTag, requireIdentity, tagExists } from './git.ts';
import { buildOrder, internalClosure } from './graph.ts';
import {
  install,
  packTo,
  publish,
  type PublishResult,
  requireLogin,
  trustGithub,
  trustList,
} from './npm.ts';
import type { ReleasePlan } from './plan.ts';
import { fetchPackage, waitForVersion } from './registry.ts';
import { buildPackages, verifyPackages } from './verify.ts';
import { bumpKind } from './versions.ts';
import { readManifest, type Workspace, type WorkspacePackage } from './workspace.ts';

export const RELEASE_WORKFLOW = 'release.yml';
export const RELEASE_ENVIRONMENT = 'npm';
/** written by the CI build job, read by .github/scripts/publish-tarballs.mjs */
export const RELEASE_MANIFEST = 'release.json';

/**
 * laptop: publish now with your npm login.
 * github: prepare here (versions, changelogs, commit, tags, trusted publishing); the workflow publishes.
 * ci: inside the workflow's build job: check and pack; a separate job publishes the tarballs.
 */
export type Target = 'laptop' | 'github' | 'ci';

export type ItemResult =
  'published' | 'already' | 'dry-run' | 'prepared' | 'packed' | 'failed' | 'pending';

export interface ReleaseOutcome {
  results: Map<string, ItemResult>;
  committed: boolean;
  tags: string[];
}

const toPosix = (p: string) => p.split(sep).join('/');

/** package.json text with the original indentation and a trailing newline. */
export function serializeManifest(original: string, manifest: object): string {
  const indent = /^([ \t]+)"/m.exec(original)?.[1] ?? '  ';
  return `${JSON.stringify(manifest, null, indent)}\n`;
}

/** What the plan will change, shown before asking to go ahead. */
export function printPlan(ctx: Context, plan: ReleasePlan, target: Target): void {
  ctx.log.heading('Release plan');
  ctx.log.table(
    ['Package', 'Version', 'Why', 'npm tag'],
    plan.items.map((i) => [
      i.pkg.name,
      i.from === i.to ? i.to : `${i.from} -> ${i.to} (${bumpKind(i.from, i.to)})`,
      i.reason,
      i.tag,
    ]),
  );
  if (plan.rangeChanges.length > 0) {
    ctx.log.blank();
    ctx.log.info('Dependency ranges that change:');
    for (const r of plan.rangeChanges) {
      ctx.log.info(`  ${r.pkg.name}  ${r.field}  ${r.dep}  ${r.from} -> ${r.to}`);
    }
  }
  for (const w of plan.warnings) {
    ctx.log.warn(w);
  }
  ctx.log.blank();
  const where = {
    laptop: 'Publish from this laptop (npm 2FA for each package).',
    github:
      'Prepare here (versions, changelogs, commit, tags); the GitHub release workflow publishes with provenance.',
    ci: 'GitHub Actions: check and pack here; the publish job publishes the tarballs (trusted publishing).',
  }[target];
  ctx.log.info(where);
}

/**
 * Runs a planned release.
 * - Every package is checked before the first one is published (its internal dependencies are built first).
 * - Until something reaches npm, any failure (or Ctrl+C) puts every file back as it was.
 * - A failed publish stops the run: what went out stays out, the rest stays pending (`npm run publish`
 *   finishes it later); the release commit and tags are still made for what went out.
 */
export async function runRelease(
  ctx: Context,
  ws: Workspace,
  plan: ReleasePlan,
  options: { target: Target; dryRun: boolean; packDir?: string },
): Promise<ReleaseOutcome> {
  const { target, dryRun } = options;
  const results = new Map<string, ItemResult>(plan.items.map((i) => [i.pkg.name, 'pending']));
  const usesGit = !dryRun && target !== 'ci';

  // Checks that need no file change come first: a failure here leaves nothing to undo.
  if (usesGit) {
    await requireIdentity(ctx);
  }
  if (target === 'github') {
    await prepareForGithub(ctx, plan, dryRun);
  }

  // Snapshot every file this run may write.
  const manifestFiles = new Map(
    [...plan.manifests].map(([name, manifest]) => {
      const pkg = ws.byName.get(name);
      if (!pkg) {
        throw new Error(`Unknown package ${name}`);
      }
      return [join(pkg.dir, 'package.json'), manifest] as const;
    }),
  );
  const snapshot = new Map<string, string | null>();
  const remember = (file: string) => {
    if (!snapshot.has(file)) {
      snapshot.set(file, existsSync(file) ? readFileSync(file, 'utf8') : null);
    }
  };
  [...manifestFiles.keys(), join(ctx.root, 'package-lock.json')].forEach(remember);
  for (const item of plan.items) {
    remember(join(item.pkg.dir, 'CHANGELOG.md'));
  }
  const restore = () => {
    for (const [file, text] of snapshot) {
      if (text === null) {
        rmSync(file, { force: true });
      } else if (!existsSync(file) || readFileSync(file, 'utf8') !== text) {
        writeFileSync(file, text);
      }
    }
  };
  const somethingOut = () =>
    [...results.values()].some((r) => r === 'published' || r === 'already');
  const onSigint = () => {
    if (dryRun || !somethingOut()) {
      restore();
      process.stderr.write('\nStopped. Every file is back as it was; nothing was published.\n');
    } else {
      process.stderr.write('\nStopped after publishing. Run npm run publish to finish.\n');
    }
    process.exit(130);
  };
  process.once('SIGINT', onSigint);

  let stopped: CliError | null = null;
  try {
    // Write the new versions and ranges. A dry run writes them too (so the checks and
    // `npm publish --dry-run` see the planned versions) and puts them back at the end.
    if (manifestFiles.size > 0) {
      for (const [file, manifest] of manifestFiles) {
        writeFileSync(file, serializeManifest(snapshot.get(file) ?? '', manifest));
      }
      if (!dryRun) {
        await install(ctx);
      }
    }

    // Check everything before publishing anything: internal dependencies are built first, then
    // every released package is checked in build order (devDependencies count).
    const fresh = new Map<string, WorkspacePackage>(
      plan.items.map((i) => [
        i.pkg.name,
        { ...i.pkg, version: i.to, manifest: readManifest(i.pkg.dir) },
      ]),
    );
    const order = buildOrder([...fresh.keys()], ws);
    const needed = buildOrder(internalClosure([...fresh.keys()], ws), ws).flatMap((n) => {
      const pkg = ws.byName.get(n);
      return pkg ? [pkg] : [];
    });
    await buildPackages(ctx, needed);
    await verifyPackages(
      ctx,
      order.flatMap((n) => {
        const pkg = fresh.get(n);
        return pkg ? [pkg] : [];
      }),
    );

    // In CI the tarballs must match the tagged commit, whose changelogs the laptop already wrote.
    if (!dryRun && target !== 'ci') {
      for (const [file, text] of await buildChangelogs(ctx, plan.items, plan.rangeChanges)) {
        writeFileSync(file, text);
      }
    }

    if (target === 'github') {
      for (const item of plan.items) {
        results.set(item.pkg.name, dryRun ? 'dry-run' : 'prepared');
      }
    } else if (target === 'ci') {
      await packAll(ctx, plan, results, options.packDir ?? 'release-tarballs');
    } else {
      if (!dryRun) {
        await requireLogin(ctx); // the 2-hour npm session may have run out during the checks
      }
      stopped = await publishAll(ctx, plan, results, { dryRun });
    }
  } catch (error) {
    if (!dryRun && !somethingOut()) {
      restore();
      ctx.log.warn('Every file is back as it was; nothing was published.');
    }
    throw error;
  } finally {
    process.removeListener('SIGINT', onSigint);
    if (dryRun) {
      restore();
    }
  }

  // Release commit and tags (never pushed). Also after a stop, for what went out.
  let committed = false;
  const tags: string[] = [];
  if (usesGit) {
    try {
      const changed = [...snapshot]
        .filter(
          ([file, before]) => (existsSync(file) ? readFileSync(file, 'utf8') : null) !== before,
        )
        .map(([file]) => toPosix(relative(ctx.root, file)));
      if (changed.length > 0) {
        const title =
          target === 'github'
            ? 'chore(release): version packages'
            : 'chore(release): publish packages';
        const body = plan.items
          .map((i) => `- ${i.pkg.name}@${i.to} (${results.get(i.pkg.name) ?? 'pending'})`)
          .join('\n');
        await commit(ctx, changed, `${title}\n\n${body}`);
        committed = true;
      }
      for (const item of plan.items) {
        if (!['published', 'already', 'prepared'].includes(results.get(item.pkg.name) ?? '')) {
          continue;
        }
        const tag = `${item.pkg.name}@${item.to}`;
        if (!(await tagExists(ctx, tag))) {
          await createTag(ctx, tag, `${item.pkg.name} ${item.to}`);
          tags.push(tag);
        }
      }
    } catch (error) {
      printSummary(ctx, plan, results, { committed, tags, target, dryRun });
      const out = plan.items.filter((i) => results.get(i.pkg.name) === 'published');
      throw new CliError(
        `The release commit or tags could not be made: ${(error as Error).message}`,
        {
          code: 'GIT_FINALIZE_FAILED',
          hint:
            out.length > 0
              ? `Already on npm: ${out.map((i) => `${i.pkg.name}@${i.to}`).join(', ')}. Commit the changed files and tag each one (git tag -a <name>@<version>).`
              : 'Commit the changed files yourself.',
        },
      );
    }
  }

  printSummary(ctx, plan, results, { committed, tags, target, dryRun });
  if (stopped) {
    throw stopped;
  }
  return { results, committed, tags };
}

/** One publish attempt, with "already on npm" double-checked against the registry. */
async function publishOnce(
  ctx: Context,
  pkg: WorkspacePackage,
  to: string,
  tag: string,
  dryRun: boolean,
): Promise<PublishResult & { already?: boolean }> {
  const res = await publish(ctx, { ...pkg, version: to }, { tag, dryRun });
  if (res.ok || res.failure !== 'exists') {
    return res;
  }
  const info = await fetchPackage(ctx, pkg.name, { fresh: true });
  if (info?.versions.includes(to)) {
    return { ok: true, already: true };
  }
  return {
    ok: false,
    failure: 'other',
    message: `npm refuses ${to}: the version was used before (and unpublished), so it can never be used again. Release a new version with npm run republish.`,
  };
}

async function publishAll(
  ctx: Context,
  plan: ReleasePlan,
  results: Map<string, ItemResult>,
  options: { dryRun: boolean },
): Promise<CliError | null> {
  const stop = (name: string, reason: string) => {
    results.set(name, 'failed');
    const rest = plan.items
      .filter((i) => results.get(i.pkg.name) === 'pending')
      .map((i) => i.pkg.name);
    return new CliError(`Stopped at ${name}: ${reason}`, {
      code: 'PUBLISH_INCOMPLETE',
      hint: `Versions stay in package.json. Run npm run publish to publish the rest (${[name, ...rest].join(', ')}).`,
    });
  };

  for (const item of plan.items) {
    const { pkg } = item;
    ctx.log.heading(`Publishing ${pkg.name}@${item.to}${options.dryRun ? ' (dry run)' : ''}`);
    try {
      const info = await fetchPackage(ctx, pkg.name, { fresh: true });
      if (info?.versions.includes(item.to)) {
        ctx.log.success('already on npm, skipped');
        results.set(pkg.name, 'already');
        continue;
      }
      for (;;) {
        const res = await publishOnce(ctx, pkg, item.to, item.tag, options.dryRun);
        if (res.ok) {
          if (res.already) {
            results.set(pkg.name, 'already');
            ctx.log.success('already on npm, skipped');
          } else if (options.dryRun) {
            results.set(pkg.name, 'dry-run');
          } else {
            if (!(await waitForVersion(ctx, pkg.name, item.to))) {
              ctx.log.warn(
                `npm accepted ${pkg.name}@${item.to}, but the registry does not show it yet.`,
              );
            }
            results.set(pkg.name, 'published');
            ctx.log.success(`published ${pkg.name}@${item.to}`);
          }
          break;
        }
        ctx.log.error(res.message ?? 'npm publish failed');
        const again =
          ctx.interactive &&
          (await ctx.prompt.select<'retry' | 'stop'>(`Publishing ${pkg.name} failed. What now?`, [
            {
              name: 'Try again',
              value: 'retry',
              description:
                res.failure === 'auth' ? 'run npm run login in another terminal first' : undefined,
            },
            { name: 'Stop here (published packages stay published)', value: 'stop' },
          ])) === 'retry';
        if (!again) {
          return stop(pkg.name, res.message ?? 'publish failed');
        }
      }
    } catch (error) {
      // network trouble or Ctrl+C at the question: stop, but keep what already went out
      return stop(
        pkg.name,
        error instanceof CancelledError ? 'stopped by you' : (error as Error).message,
      );
    }
  }
  return null;
}

/**
 * CI build job: pack every package (dependencies first) and write release.json for the publish job.
 * The publish job never installs or runs repository code; it only uploads these tarballs.
 */
async function packAll(
  ctx: Context,
  plan: ReleasePlan,
  results: Map<string, ItemResult>,
  dir: string,
): Promise<void> {
  const outDir = resolve(ctx.root, dir);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const entries = [];
  for (const item of plan.items) {
    const file = await packTo(ctx, item.pkg, outDir);
    results.set(item.pkg.name, 'packed');
    ctx.log.success(`packed ${item.pkg.name}@${item.to} -> ${file}`);
    entries.push({ name: item.pkg.name, version: item.to, tag: item.tag, file });
  }
  writeFileSync(join(outDir, RELEASE_MANIFEST), `${JSON.stringify(entries, null, 2)}\n`);
}

/**
 * GitHub target, before anything is written: every package must exist on npm and trust exactly this
 * repository's release workflow and environment. A different existing config is not overwritten
 * (npm allows one per package): the user revokes it first.
 */
async function prepareForGithub(ctx: Context, plan: ReleasePlan, dryRun: boolean): Promise<void> {
  await requireLogin(ctx);
  ctx.log.heading('Trusted publishing (GitHub Actions)');
  for (const { pkg } of plan.items) {
    const configs = await trustList(ctx, pkg.name);
    const ours = configs.find(
      (c) =>
        (c.file ?? '').endsWith(RELEASE_WORKFLOW) &&
        (c.repository ?? '').toLowerCase() === ctx.repository.slug.toLowerCase() &&
        (c.environment === undefined || c.environment === RELEASE_ENVIRONMENT),
    );
    if (ours) {
      ctx.log.success(`${pkg.name}: trusts ${ctx.repository.slug} ${RELEASE_WORKFLOW}`);
      continue;
    }
    const other = configs[0];
    if (other) {
      throw new CliError(
        `${pkg.name} already trusts another workflow (${other.repository ?? '?'} ${other.file ?? '?'}` +
          `${other.environment ? `, environment ${other.environment}` : ''}).`,
        {
          code: 'TRUST_MISMATCH',
          hint: `Remove it first: npm trust revoke ${pkg.name} --id ${other.id ?? '<id from npm trust list>'}. Nothing was changed.`,
        },
      );
    }
    if (dryRun) {
      ctx.log.warn(`${pkg.name}: would set up trusted publishing for ${RELEASE_WORKFLOW}`);
    } else {
      await trustGithub(ctx, pkg.name, {
        workflow: RELEASE_WORKFLOW,
        environment: RELEASE_ENVIRONMENT,
      });
      ctx.log.success(`${pkg.name}: now trusts ${ctx.repository.slug} ${RELEASE_WORKFLOW}`);
    }
  }
}

function printSummary(
  ctx: Context,
  plan: ReleasePlan,
  results: Map<string, ItemResult>,
  info: { committed: boolean; tags: string[]; target: Target; dryRun: boolean },
): void {
  const label: Record<ItemResult, string> = {
    published: styleText('green', 'published'),
    already: 'already on npm',
    'dry-run': 'dry run ok',
    prepared: styleText('green', 'ready for GitHub'),
    packed: styleText('green', 'packed'),
    failed: styleText('red', 'failed'),
    pending: styleText('yellow', 'not published'),
  };
  ctx.log.heading('Summary');
  ctx.log.table(
    ['Package', 'Version', 'Result'],
    plan.items.map((i) => [i.pkg.name, i.to, label[results.get(i.pkg.name) ?? 'pending']]),
  );
  ctx.log.blank();
  if (info.dryRun) {
    ctx.log.info('Dry run: no file, git or npm change was made.');
    return;
  }
  if (info.committed) {
    ctx.log.success('Release commit created.');
  }
  if (info.tags.length > 0) {
    ctx.log.success(`Tags: ${info.tags.join(', ')}`);
  }
  if (info.target === 'github') {
    ctx.log.info(
      'Next: git push --follow-tags, then run the "Release" workflow on GitHub (main) within 48 hours.',
    );
  } else if (info.committed || info.tags.length > 0) {
    ctx.log.info('Next: git push --follow-tags');
  }
}
