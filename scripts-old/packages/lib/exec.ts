import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CliError } from './errors.ts';

/**
 * - `pipe`: capture everything (stdin closed).
 * - `inherit`: the user sees the command and can answer its prompts; nothing is captured.
 * - `tee`: like inherit, but stderr is also captured, so npm errors can be classified
 *   while npm's own 2FA prompt (which needs a TTY stdout) still works.
 */
export type StdioMode = 'pipe' | 'inherit' | 'tee';

export interface RunOptions {
  cwd?: string;
  stdio?: StdioMode;
  env?: Record<string, string | undefined>;
}

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export type Command = 'npm' | 'git' | 'node';
export type Runner = (command: Command, args: string[], options?: RunOptions) => Promise<RunResult>;

/** npm's JS entry, so npm runs without a shell (no quoting problems, works the same on Windows). */
export function findNpmCli(): string | null {
  const fromEnv = process.env.npm_execpath;
  if (fromEnv && /npm-cli\.[cm]?js$/.test(fromEnv) && existsSync(fromEnv)) {
    return fromEnv;
  }
  const nodeDir = dirname(process.execPath);
  const candidates = [
    join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  return candidates.find((c) => existsSync(c)) ?? null;
}

/**
 * Config that `npm run <script> --flag` leaks into the environment. Child npm commands must not
 * inherit it (e.g. `npm run publish --dry-run` would silently turn every child into a dry run).
 */
const LEAKED_NPM_CONFIG = [
  'npm_config_dry_run',
  'npm_config_workspace',
  'npm_config_workspaces',
  'npm_config_include_workspace_root',
  'npm_config_tag',
  'npm_config_access',
  'npm_config_otp',
  // output switches: npm run -s / --json would hide the error codes and 2FA links we rely on
  'npm_config_loglevel',
  'npm_config_silent',
  'npm_config_json',
  'npm_config_parseable',
];

export function childEnv(extra: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  const removed = new Set(Object.keys(extra).filter((key) => extra[key] === undefined));
  const kept = Object.entries(process.env).filter(
    ([key]) => !LEAKED_NPM_CONFIG.includes(key.toLowerCase()) && !removed.has(key),
  );
  const added = Object.entries(extra).filter(([, value]) => value !== undefined);
  return Object.fromEntries([...kept, ...added]);
}

export function createRunner(): Runner {
  const npmCli = findNpmCli();
  return (command, args, options = {}) => {
    const stdio = options.stdio ?? 'pipe';
    let file: string;
    let fullArgs: string[];
    if (command === 'npm') {
      if (!npmCli) {
        throw new CliError('Could not find the npm CLI next to this Node.js.', {
          code: 'NPM_NOT_FOUND',
          hint: 'Run the command through npm (npm run <script>) or reinstall Node.js.',
        });
      }
      file = process.execPath;
      fullArgs = [npmCli, ...args];
    } else if (command === 'node') {
      file = process.execPath;
      fullArgs = args;
    } else {
      file = command;
      fullArgs = args;
    }

    return new Promise<RunResult>((resolve, reject) => {
      const child = spawn(file, fullArgs, {
        cwd: options.cwd,
        env: childEnv(options.env),
        stdio:
          stdio === 'inherit'
            ? 'inherit'
            : stdio === 'tee'
              ? ['inherit', 'inherit', 'pipe']
              : ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
      let stdout = '';
      let stderr = '';
      child.stdout?.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        stderr += text;
        if (stdio === 'tee') {
          process.stderr.write(text);
        }
      });
      child.on('error', (error) => {
        reject(
          new CliError(`Could not start "${command}": ${error.message}`, {
            code: 'SPAWN_FAILED',
            hint: command === 'git' ? 'Is Git installed and on PATH?' : undefined,
          }),
        );
      });
      child.on('close', (code, signal) => {
        resolve({ code: code ?? (signal ? 130 : 1), stdout, stderr });
      });
    });
  };
}
