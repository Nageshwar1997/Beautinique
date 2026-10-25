import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { publint } from 'publint';
import { formatMessage } from 'publint/utils';

import type { Context } from './context.ts';
import { CliError } from './errors.ts';
import { packDryRun, runScript } from './npm.ts';
import type { PackageManifest, WorkspacePackage } from './workspace.ts';

/** Run in this order; a package without a script simply skips that step. */
export const SCRIPT_STEPS = ['build', 'typecheck', 'lint', 'test', 'check'] as const;

const FORBIDDEN: { pattern: RegExp; what: string }[] = [
  { pattern: /(^|\/)\.env(\.|$)/, what: 'an .env file' },
  { pattern: /\.(test|spec)\.[cm]?[jt]sx?$/, what: 'a test file' },
  { pattern: /(^|\/)__tests__\//, what: 'a test folder' },
  { pattern: /\.tsbuildinfo$/, what: 'a TypeScript build cache' },
  { pattern: /(^|\/)node_modules\//, what: 'node_modules' },
  { pattern: /(^|\/)\.DS_Store$/, what: 'a .DS_Store file' },
  { pattern: /\.log$/, what: 'a log file' },
];

/** Every file path the manifest points at: main/module/types/style/bin and all of exports. */
export function entryTargets(manifest: PackageManifest): string[] {
  const targets: string[] = [];
  for (const key of ['main', 'module', 'types', 'typings', 'style'] as const) {
    const value = manifest[key];
    if (typeof value === 'string') {
      targets.push(value);
    }
  }
  if (typeof manifest.bin === 'string') {
    targets.push(manifest.bin);
  } else if (manifest.bin) {
    targets.push(...Object.values(manifest.bin));
  }
  const walk = (node: unknown) => {
    if (typeof node === 'string') {
      targets.push(node);
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  };
  walk(manifest.exports);
  return [...new Set(targets.map((t) => t.replace(/^\.\//, '')))];
}

const globToRegExp = (glob: string) =>
  new RegExp(
    `^${glob
      .split('*')
      .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('.+')}$`,
  );

/** Problems with what `npm pack` would ship; [] when it is fine. */
export function checkPackedFiles(pkg: WorkspacePackage, files: string[]): string[] {
  const problems: string[] = [];
  const set = new Set(files);
  for (const required of ['package.json', 'README.md']) {
    if (!set.has(required)) {
      problems.push(`${required} is not in the package.`);
    }
  }
  if (!files.some((f) => /^licen[cs]e(\.(md|txt))?$/i.test(f))) {
    problems.push('LICENSE is not in the package (copy the root LICENSE into the package folder).');
  }
  for (const target of entryTargets(pkg.manifest)) {
    const found = target.includes('*')
      ? files.some((f) => globToRegExp(target).test(f))
      : set.has(target);
    if (!found) {
      problems.push(
        `package.json points at "./${target}", but it is not in the package (not built, or missing from "files").`,
      );
    }
  }
  for (const file of files) {
    const bad = FORBIDDEN.find((f) => f.pattern.test(file));
    if (bad) {
      problems.push(`${file} is ${bad.what} and must not be published.`);
    }
  }
  return problems;
}

/**
 * Declaration files that carry a copy of another package's types. The type bundler (tsdown) copies
 * in the types of anything that is not a dependency or peer dependency, and marks each copied file
 * with a `//#region .../node_modules/<package>/...` line. A copy makes the package heavy and gives
 * consumers two incompatible versions of the same types.
 */
export function inlinedDependencyTypes(pkg: WorkspacePackage, files: string[]): string[] {
  const problems: string[] = [];
  for (const file of files.filter((f) => /\.d\.[cm]?ts$/.test(f))) {
    let text: string;
    try {
      text = readFileSync(join(pkg.dir, file), 'utf8');
    } catch {
      continue;
    }
    const copied = new Set<string>();
    for (const [, path = ''] of text.matchAll(/^\/\/#region (.*node_modules\/.*)$/gm)) {
      const after = path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);
      const parts = after.split('/');
      copied.add(after.startsWith('@') ? `${parts[0] ?? ''}/${parts[1] ?? ''}` : (parts[0] ?? ''));
    }
    for (const name of copied) {
      problems.push(
        `${file} carries a copy of the types of "${name}": add "${name}" to dependencies or peerDependencies, so it stays outside the build.`,
      );
    }
  }
  return problems;
}

const SCRIPT_TARGET = /\.(d\.)?[cm]?[jt]s$/;

/**
 * Entry points TypeScript should resolve (types or JS), for arethetypeswrong. CSS, fonts and other
 * assets are left out (TypeScript cannot resolve them, which is fine), and so are wildcard subpaths.
 */
export function typedEntrypoints(manifest: PackageManifest): string[] {
  const exportsField = manifest.exports;
  if (exportsField === undefined || exportsField === null) {
    return typeof manifest.types === 'string' || typeof manifest.main === 'string' ? ['.'] : [];
  }
  const isSubpathMap =
    typeof exportsField === 'object' &&
    !Array.isArray(exportsField) &&
    Object.keys(exportsField).every((k) => k.startsWith('.'));
  const entries: [string, unknown][] = isSubpathMap
    ? Object.entries(exportsField as Record<string, unknown>)
    : [['.', exportsField]];
  return entries
    .filter(([subpath, target]) => {
      if (subpath.includes('*') || subpath === './package.json') {
        return false;
      }
      const targets = JSON.stringify(target ?? null);
      return (
        targets.includes('"types"') ||
        entryTargets({ name: '', version: '', exports: target }).some((t) => SCRIPT_TARGET.test(t))
      );
    })
    .map(([subpath]) => subpath);
}

function lastLines(text: string, count = 60): string {
  const lines = text.split(/\r?\n/);
  return lines.length > count ? ['...', ...lines.slice(-count)].join('\n') : text;
}

/** The attw CLI that ships with this tooling (resolved from here, not from the checked repo). */
function attwBin(): string {
  const require = createRequire(import.meta.url);
  const manifestPath = require.resolve('@arethetypeswrong/cli/package.json');
  const { bin } = JSON.parse(readFileSync(manifestPath, 'utf8')) as { bin: Record<string, string> };
  return join(dirname(manifestPath), bin.attw ?? 'dist/index.js');
}

async function runAttw(
  ctx: Context,
  pkg: WorkspacePackage,
  entrypoints: string[],
): Promise<string[]> {
  const bin = attwBin();
  const res = await ctx.run(
    'node',
    [
      bin,
      '--pack',
      pkg.dir,
      '--entrypoints',
      ...entrypoints,
      '--profile',
      'esm-only',
      '--format',
      'ascii',
      '--no-emoji',
      '--no-color',
    ],
    { cwd: ctx.root },
  );
  return res.code === 0
    ? []
    : [
        `Types check (arethetypeswrong) failed:\n${lastLines(`${res.stdout}${res.stderr}`.trim(), 40)}`,
      ];
}

/** Runs `build` (when there is one) for packages that others need, in the order given. */
export async function buildPackages(ctx: Context, packages: WorkspacePackage[]): Promise<void> {
  for (const pkg of packages) {
    const result = await runScript(ctx, pkg, 'build');
    if (!result.ran) {
      continue;
    }
    if (!result.ok) {
      ctx.log.error(`build of ${pkg.name} failed`);
      ctx.log.info(lastLines(result.output));
      throw new CliError(`${pkg.name} (a dependency) does not build.`, {
        code: 'VERIFY_FAILED',
        hint: `Try: npm run build --workspace ${pkg.name}`,
      });
    }
    ctx.log.success(`built dependency ${pkg.name}`);
  }
}

/**
 * Checks packages before anything is published, dependencies first. Stops at the first package with a
 * problem, because its dependents would fail for the same reason.
 */
export async function verifyPackages(ctx: Context, packages: WorkspacePackage[]): Promise<void> {
  for (const pkg of packages) {
    ctx.log.heading(`Checking ${pkg.name}`);
    for (const step of SCRIPT_STEPS) {
      const result = await runScript(ctx, pkg, step);
      if (!result.ran) {
        continue;
      }
      if (!result.ok) {
        ctx.log.error(`${step} failed`);
        ctx.log.info(lastLines(result.output));
        throw new CliError(`${pkg.name}: "${step}" failed.`, {
          code: 'VERIFY_FAILED',
          hint: `Fix it, then run the command again. Try: npm run ${step} --workspace ${pkg.name}`,
        });
      }
      ctx.log.success(step);
    }

    const problems: string[] = [];
    if (pkg.publishable) {
      const pack = await packDryRun(ctx, pkg);
      const packed = pack.files.map((f) => f.path);
      problems.push(...checkPackedFiles(pkg, packed), ...inlinedDependencyTypes(pkg, packed));

      const { messages, pkg: packageJson } = await publint({
        pkgDir: pkg.dir,
        level: 'warning',
        pack: 'npm',
      });
      problems.push(...messages.map((m) => `publint: ${formatMessage(m, packageJson) ?? m.code}`));

      const entrypoints = typedEntrypoints(pkg.manifest);
      if (problems.length === 0 && entrypoints.length > 0) {
        problems.push(...(await runAttw(ctx, pkg, entrypoints)));
      }
      if (problems.length === 0) {
        ctx.log.success(
          `package contents (${String(pack.files.length)} files, ${(pack.unpackedSize / 1024).toFixed(1)} KB)`,
        );
      }
    }
    if (problems.length > 0) {
      for (const p of problems) {
        ctx.log.error(p);
      }
      throw new CliError(`${pkg.name} is not ready to publish.`, {
        code: 'VERIFY_FAILED',
        hint: 'Nothing was published.',
      });
    }
  }
}
