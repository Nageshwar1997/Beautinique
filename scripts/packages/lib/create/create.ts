import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CATEGORIES, type Category, type Context } from '../context.ts';
import { CancelledError, CliError } from '../errors.ts';
import { formatFile } from '../format.ts';
import { install } from '../npm.ts';
import { fetchPackage } from '../registry.ts';
import { verifyPackages } from '../verify.ts';
import { bump, highest } from '../versions.ts';
import { loadWorkspace, type Workspace } from '../workspace.ts';
import {
  type Kind,
  KIND_LABELS,
  KINDS_BY_CATEGORY,
  packageName,
  type PackageSpec,
  renderPackage,
  type Visibility,
} from './templates.ts';
import { parseKeywords, validateDescription, validateKeywords, validateName } from './validate.ts';

export interface CreateFlags {
  category?: string;
  kind?: string;
  name?: string;
  description?: string;
  keywords?: string;
  visibility?: string;
  extends?: string;
  /** write files only: no npm install and no checks (tests) */
  skipInstall?: boolean;
}

const fail = (message: string) => {
  throw new CliError(message, { code: 'BAD_FLAGS', hint: 'See npm run create -- --help.' });
};

async function answer<T extends string>(
  flag: string | undefined,
  allowed: readonly T[],
  ask: () => Promise<T>,
  label: string,
): Promise<T> {
  if (flag !== undefined) {
    if (!(allowed as readonly string[]).includes(flag)) {
      fail(`--${label} must be one of: ${allowed.join(', ')}.`);
    }
    return flag as T;
  }
  const only = allowed.length === 1 ? allowed[0] : undefined;
  return only ?? ask();
}

async function text(
  ctx: Context,
  flag: string | undefined,
  message: string,
  validate: (v: string) => true | string,
  label: string,
): Promise<string> {
  if (flag !== undefined) {
    const verdict = validate(flag);
    if (verdict !== true) {
      fail(`--${label}: ${verdict}`);
    }
    return flag.trim();
  }
  return (await ctx.prompt.input(message, { validate })).trim();
}

/** First version: 1.0.0, or the next major when the name already exists on npm (e.g. the old BQ-Packages). */
async function startVersion(
  ctx: Context,
  name: string,
): Promise<{ version: string; npmLatest: string | null }> {
  const info = await fetchPackage(ctx, name);
  const latest = info ? (info.distTags.latest ?? highest(info.versions)) : null;
  return { version: latest ? bump(latest, 'major') : '1.0.0', npmLatest: latest };
}

export async function createPackage(ctx: Context, flags: CreateFlags): Promise<string> {
  const ws: Workspace = loadWorkspace(ctx);

  ctx.log.heading('New package');
  const category = await answer<Category>(
    flags.category,
    CATEGORIES,
    () =>
      ctx.prompt.select<Category>('Category', [
        { name: 'shared    (works everywhere: no DOM, no Node APIs)', value: 'shared' },
        { name: 'frontend  (browser / React apps)', value: 'frontend' },
        { name: 'backend   (Node services)', value: 'backend' },
      ]),
    'category',
  );
  const kind = await answer<Kind>(
    flags.kind,
    KINDS_BY_CATEGORY[category],
    () =>
      ctx.prompt.select<Kind>(
        'Kind',
        KINDS_BY_CATEGORY[category].map((k) => ({ name: KIND_LABELS[k], value: k })),
      ),
    'kind',
  );
  const folder = await text(
    ctx,
    flags.name,
    `Name (becomes ${ctx.scope}/${category}-<name>)`,
    (v) => validateName(v, { root: ctx.root, scope: ctx.scope, category, workspace: ws }),
    'name',
  );
  const description = (
    await text(
      ctx,
      flags.description,
      'Description (one sentence)',
      validateDescription,
      'description',
    )
  ).replace(/\s+/g, ' ');
  const keywords = parseKeywords(
    flags.keywords === undefined
      ? await ctx.prompt.input('Keywords (comma separated, optional)', {
          default: '',
          validate: validateKeywords,
        })
      : await text(ctx, flags.keywords, '', validateKeywords, 'keywords'),
  );
  const visibility = await answer<Visibility>(
    flags.visibility,
    ['public', 'private'],
    () =>
      ctx.prompt.select<Visibility>('Visibility', [
        { name: 'public   (published to npm)', value: 'public' },
        { name: 'private  (only used inside this monorepo)', value: 'private' },
      ]),
    'visibility',
  );

  // frontend/backend TypeScript packages can build on a shared package and re-export it
  let extendsPackage: PackageSpec['extendsPackage'] = null;
  if (category !== 'shared' && kind !== 'css') {
    const shared = ws.packages.filter(
      (p) => p.category === 'shared' && (visibility === 'private' || p.publishable),
    );
    const names = shared.map((p) => p.folder);
    const picked =
      flags.extends ??
      (shared.length === 0
        ? 'none'
        : await ctx.prompt.select<string>(
            'Build on a shared package? (re-exports it)',
            [
              { name: 'No', value: 'none' },
              ...shared.map((p) => ({ name: p.name, value: p.folder })),
            ],
            { default: names.includes(folder) ? folder : 'none' },
          ));
    if (picked !== 'none') {
      const base = shared.find((p) => p.folder === picked);
      if (!base) {
        fail(
          `--extends: no ${visibility === 'public' ? 'public ' : ''}shared package "${picked}". Choose: ${['none', ...names].join(', ')}.`,
        );
      } else {
        extendsPackage = { name: base.name, version: base.version };
      }
    }
  }

  const name = `${ctx.scope}/${category}-${folder}`;
  const { version, npmLatest } =
    visibility === 'public' ? await startVersion(ctx, name) : { version: '1.0.0', npmLatest: null };
  const rootManifest = JSON.parse(readFileSync(join(ctx.root, 'package.json'), 'utf8')) as {
    devDependencies?: Record<string, string>;
  };
  const licenseFile = join(ctx.root, 'LICENSE');
  if (visibility === 'public' && !existsSync(licenseFile)) {
    throw new CliError('The repository has no LICENSE file to copy into the package.', {
      code: 'NO_LICENSE',
    });
  }
  const spec: PackageSpec = {
    scope: ctx.scope,
    category,
    folder,
    kind,
    visibility,
    description,
    keywords,
    version,
    extendsPackage,
    author: ctx.author,
    license: ctx.license,
    repository: ctx.repository,
    defaultBranch: 'main',
    toolVersions: rootManifest.devDependencies ?? {},
    rootLicenseText: visibility === 'public' ? readFileSync(licenseFile, 'utf8') : '',
  };
  const relDir = `packages/${category}/${folder}`;
  const files = renderPackage(spec);

  ctx.log.heading('Summary');
  ctx.log.table(
    ['', ''],
    [
      ['Name', packageName(spec)],
      ['Folder', relDir],
      ['Kind', KIND_LABELS[kind]],
      ['Visibility', visibility],
      ['Version', version],
      ['Builds on', extendsPackage?.name ?? '-'],
      ['Files', [...files.keys()].join(', ')],
    ],
  );
  if (npmLatest) {
    ctx.log.warn(
      `${name} already exists on npm (latest ${npmLatest}), so this package starts at ${version}.`,
    );
  }
  if (!(await ctx.prompt.confirm('Create it?', { default: true }))) {
    throw new CancelledError();
  }

  // Write into a temporary folder first, then rename: never a half-created package.
  const target = join(ctx.root, relDir);
  const temp = join(ctx.root, 'packages', category, `.${folder}.creating`);
  rmSync(temp, { recursive: true, force: true });
  try {
    for (const [file, content] of files) {
      const path = join(temp, file);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, await formatFile(join(ctx.root, relDir, file), content));
    }
    renameSync(temp, target);
  } catch (error) {
    rmSync(temp, { recursive: true, force: true });
    throw error;
  }
  ctx.log.success(`Created ${relDir}`);

  if (flags.skipInstall) {
    return target;
  }

  // Link the new workspace and update the lockfile; undo everything if npm fails.
  const lockfile = join(ctx.root, 'package-lock.json');
  const lockBefore = existsSync(lockfile) ? readFileSync(lockfile, 'utf8') : null;
  try {
    await install(ctx);
  } catch (error) {
    rmSync(target, { recursive: true, force: true });
    if (lockBefore !== null) {
      writeFileSync(lockfile, lockBefore);
    }
    ctx.log.warn(`Removed ${relDir} again because npm install failed.`);
    throw error;
  }

  const created = loadWorkspace(ctx).byName.get(name);
  if (!created) {
    throw new Error(`${name} was created but is not in the workspace`);
  }
  await verifyPackages(ctx, [created]);

  ctx.log.heading('Next steps');
  ctx.log.info(`1. Write the code in ${relDir}/src and document it in README.md.`);
  ctx.log.info(`2. Commit it (Conventional Commits, e.g. "feat(${category}-${folder}): ...").`);
  ctx.log.info(
    visibility === 'public'
      ? `3. npm run publish  -> publishes ${name}@${version}`
      : '3. Import it from apps and other packages.',
  );
  return target;
}
