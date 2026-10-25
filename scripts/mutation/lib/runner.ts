import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { type ChangedLines, parseChangedLines, touches } from './diff.ts';
import { anchorLines, applyChange, type Mutation, MutationError, validateList } from './list.ts';

/** Where mutation runs find MongoDB and Valkey unless told otherwise: `npm run infra:mutation:up`. */
export const MUTATION_ENV = {
  MONGO_TEST_URI: 'mongodb://localhost:27018/?replicaSet=rs0',
  REDIS_TEST_URL: 'redis://localhost:6380',
} as const;

/** The parts of a package a test run needs. */
const PACKAGE_PARTS = [
  'src',
  'generated',
  'test',
  'package.json',
  'tsconfig.json',
  'eslint.config.js',
  'vitest.config.ts',
];

export type Outcome = 'killed' | 'survived' | 'hung';

export interface MutationResult {
  index: number;
  mutation: Mutation;
  outcome: Outcome;
  ms: number;
  /** The names of the failing tests (with `showFails`). */
  failures: string[];
}

export interface RunOptions {
  /** The repo root (node_modules and configs are taken from here). */
  root: string;
  /** The package folder, relative to root: `packages/backend/server-queue`. */
  packageDir: string;
  /** Only these mutations (their indexes in the list). */
  only?: readonly number[];
  /** Only mutations whose code changed since this git ref (RULES §6: changed lines). */
  changedSince?: string;
  /** Per test run (default 4 min); a run that takes longer counts as killed ("hung"). */
  timeoutMs?: number;
  log: (line: string) => void;
  /** Collect the names of failing tests for each killed mutation. */
  showFails?: boolean;
}

export interface RunSummary {
  results: MutationResult[];
  /** Survivors without a `survives` reason: tests to write, or a reason to add. */
  unexpected: MutationResult[];
  /** Mutations marked `survives` that a test now kills: the note can go. */
  nowKilled: MutationResult[];
}

let loads = 0;

/** The package's mutation list: its `test/mutations.ts` default export. */
export async function loadList(root: string, packageDir: string): Promise<Mutation[]> {
  const file = join(root, packageDir, 'test', 'mutations.ts');
  if (!existsSync(file)) {
    throw new MutationError(
      `${packageDir}/test/mutations.ts does not exist: write the package's mutations first (RULES §6)`,
    );
  }
  // a fresh URL each time: ES modules are cached by URL, and the list may have changed since
  loads += 1;
  const url = `${pathToFileURL(file).href}?load=${String(loads)}`;
  const loaded = (await import(url)) as { default?: unknown };
  return validateList(loaded.default, `${packageDir}/test/mutations.ts`);
}

/** The files changed since `base` under the package's src, by git (untracked files count whole). */
export function changedLines(root: string, packageDir: string, base: string): ChangedLines {
  const src = `${packageDir}/src`;
  const diff = execFileSync('git', ['diff', '--unified=0', base, '--', src], {
    cwd: root,
    encoding: 'utf8',
  });
  const changed = parseChangedLines(diff);
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', src], {
    cwd: root,
    encoding: 'utf8',
  });
  for (const file of untracked.split(/\r?\n/).filter(Boolean)) {
    changed.set(file, [[1, Number.MAX_SAFE_INTEGER]]);
  }
  return changed;
}

/** A throwaway copy of the package beside the repo's configs and node_modules (never the real files). */
function makeCopy(root: string, packageDir: string): { dir: string; remove: () => void } {
  const base = mkdtempSync(join(tmpdir(), 'bq-mutation-'));
  const dir = join(base, packageDir);
  for (const part of PACKAGE_PARTS) {
    const from = join(root, packageDir, part);
    if (existsSync(from)) cpSync(from, join(dir, part), { recursive: true });
  }
  cpSync(join(root, 'configs'), join(base, 'configs'), { recursive: true });
  const link = join(base, 'node_modules');
  symlinkSync(join(root, 'node_modules'), link, process.platform === 'win32' ? 'junction' : 'dir');
  return {
    dir,
    remove: () => {
      // the link first and on its own, so removing the copy can never reach the real node_modules
      try {
        unlinkSync(link);
      } catch {
        rmdirSync(link);
      }
      rmSync(base, { recursive: true, force: true });
    },
  };
}

interface TestRun {
  outcome: 'pass' | 'fail' | 'hung';
  ms: number;
  failures: string[];
}

function runTests(
  root: string,
  dir: string,
  tests: string | undefined,
  timeoutMs: number,
): TestRun {
  const started = Date.now();
  const vitest = join(root, 'node_modules', 'vitest', 'vitest.mjs');
  const args = [
    vitest,
    'run',
    '--testTimeout',
    '20000',
    ...(tests === undefined ? [] : ['-t', tests]),
  ];
  const run = spawnSync(process.execPath, args, {
    cwd: dir,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...MUTATION_ENV, ...process.env },
    maxBuffer: 64 * 1024 * 1024,
  });
  const ms = Date.now() - started;
  const failures = run.stdout
    .split(/\r?\n/)
    .filter((line) => line.includes('×'))
    .map((line) => line.trim());
  if (run.error && (run.error as NodeJS.ErrnoException).code === 'ETIMEDOUT') {
    return { outcome: 'hung', ms, failures };
  }
  return { outcome: run.status === 0 ? 'pass' : 'fail', ms, failures };
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)} s`;

/**
 * Runs a package's mutations in a throwaway copy: checks every anchor first, runs the tests once
 * unchanged (they must pass), then each mutation in turn with only its tests. The real files are
 * never touched. Reports killed mutations, expected survivors, and unexpected survivors.
 */
export async function runMutations(options: RunOptions): Promise<RunSummary> {
  const { root, packageDir, only, changedSince, log, showFails = false } = options;
  const timeoutMs = options.timeoutMs ?? 4 * 60_000;
  const list = await loadList(root, packageDir);
  const sources = new Map<string, string>();
  const sourceOf = (file: string): string => {
    let text = sources.get(file);
    if (text === undefined) {
      const path = join(root, packageDir, 'src', `${file}.ts`);
      if (!existsSync(path))
        throw new MutationError(`${packageDir}: src/${file}.ts does not exist`);
      text = readFileSync(path, 'utf8');
      sources.set(file, text);
    }
    return text;
  };
  // every anchor is checked before anything runs, so a stale list fails at once
  const problems: string[] = [];
  list.forEach((mutation, index) => {
    try {
      applyChange(sourceOf(mutation.file), mutation.change, `#${String(index)} ${mutation.name}`);
    } catch (error) {
      problems.push((error as Error).message);
    }
  });
  if (problems.length > 0) throw new MutationError(problems.join('\n'));

  let chosen = list.map((mutation, index) => ({ mutation, index }));
  if (only !== undefined) chosen = chosen.filter(({ index }) => only.includes(index));
  if (changedSince !== undefined) {
    const changed = changedLines(root, packageDir, changedSince);
    // changed lines are lines of the file as it is now, so anchors are found in that same text
    chosen = chosen.filter(({ mutation }) => {
      const ranges = changed.get(`${packageDir}/src/${mutation.file}.ts`);
      const text = sourceOf(mutation.file);
      return mutation.change.some(
        ([from]) => text.includes(from) && touches(ranges, anchorLines(text, from)),
      );
    });
  }
  log(
    `Mutation check of ${packageDir}: ${String(chosen.length)} of ${String(list.length)} mutations` +
      (changedSince === undefined ? '' : ` (code changed since ${changedSince})`),
  );
  if (chosen.length === 0) return { results: [], unexpected: [], nowKilled: [] };

  const copy = makeCopy(root, packageDir);
  const results: MutationResult[] = [];
  try {
    const baseline = runTests(root, copy.dir, undefined, timeoutMs);
    if (baseline.outcome !== 'pass') {
      throw new MutationError(
        `The tests fail without any mutation (${baseline.failures.join('; ') || baseline.outcome}): fix them first. ` +
          'Backend packages need `npm run infra:mutation:up` (Mongo 27018, Valkey 6380).',
      );
    }
    log(`  baseline: pass (${seconds(baseline.ms)})`);
    for (const { mutation, index } of chosen) {
      const path = join(copy.dir, 'src', `${mutation.file}.ts`);
      const original = sourceOf(mutation.file);
      writeFileSync(path, applyChange(original, mutation.change, mutation.name));
      const run = runTests(root, copy.dir, mutation.tests, timeoutMs);
      writeFileSync(path, original);
      const outcome: Outcome =
        run.outcome === 'pass' ? 'survived' : run.outcome === 'hung' ? 'hung' : 'killed';
      const result = {
        index,
        mutation,
        outcome,
        ms: run.ms,
        failures: showFails ? run.failures : [],
      };
      results.push(result);
      const note =
        outcome === 'survived'
          ? mutation.survives === undefined
            ? '  <- needs a test, or a survives note'
            : `  (expected: ${mutation.survives})`
          : '';
      log(
        `  #${String(index)} ${outcome.padEnd(8)} ${mutation.file}: ${mutation.name} (${seconds(run.ms)})${note}`,
      );
      for (const failure of result.failures) log(`      ${failure}`);
    }
  } finally {
    copy.remove();
  }
  const unexpected = results.filter(
    (r) => r.outcome === 'survived' && r.mutation.survives === undefined,
  );
  const nowKilled = results.filter(
    (r) => r.outcome !== 'survived' && r.mutation.survives !== undefined,
  );
  const killed = results.filter((r) => r.outcome !== 'survived').length;
  log(
    `Result: ${String(killed)} of ${String(results.length)} killed, ` +
      `${String(results.length - killed - unexpected.length)} expected survivors, ${String(unexpected.length)} unexpected`,
  );
  for (const r of nowKilled) {
    log(`  #${String(r.index)} ${r.mutation.name} is killed now: remove its survives note`);
  }
  return { results, unexpected, nowKilled };
}
