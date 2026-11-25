import { spawnSync } from 'node:child_process';

import { CliError } from './cli-error.ts';

export interface ExecResult {
  status: number;
  stdout: string;
  stderr: string;
}

export interface ExecOptions {
  cwd: string;
  env?: Record<string, string>;
  /** Text for the command's standard input (a commit message, never a shell argument). */
  input?: string;
  /** Show the command's output as it runs instead of capturing it. */
  inherit?: boolean;
}

// Runs a program and waits. `git` runs without a shell; npm, npx and turbo are .cmd files on
// Windows and need one, so their arguments never carry user text.
export type Exec = (command: string, args: string[], options: ExecOptions) => ExecResult;

// Characters that cmd.exe acts on even inside double quotes (a quote ends the quoting, `%NAME%`
// expands a variable, a line break starts a new command). No argument of a shell command may hold
// one, on any platform, so a command that passes on Linux CI cannot run something else on Windows.
const SHELL_UNSAFE = /["%\r\n]/;

export function shellUnsafeArgs(args: string[]): string[] {
  return args.filter((arg) => SHELL_UNSAFE.test(arg));
}

// A shell takes one command line, so the arguments are quoted into it (passing an argument list
// to a shell is deprecated in Node).
export function shellLine(command: string, args: string[]): string {
  const unsafe = shellUnsafeArgs(args);
  if (unsafe.length > 0) {
    throw new CliError(
      'EXEC_UNSAFE_ARGUMENT',
      `${command} was given an argument a shell would act on: ${unsafe.map((arg) => JSON.stringify(arg)).join(', ')}.`,
      'Arguments of npm, npx and turbo hold no quote, % or line break; pass such text through standard input instead.',
    );
  }
  const quote = (arg: string) => (/^[\w@+=:,./-]+$/.test(arg) ? arg : `"${arg}"`);
  return [command, ...args.map(quote)].join(' ');
}

// Environment variable names are not case sensitive on Windows, so a name given here replaces the
// inherited one whatever its case (two spellings would leave the child process with either).
function mergeEnv(extra: Record<string, string> | undefined): NodeJS.ProcessEnv {
  const replaced = new Set(Object.keys(extra ?? {}).map((name) => name.toLowerCase()));
  const inherited = Object.entries(process.env).filter(
    ([name]) => !replaced.has(name.toLowerCase()),
  );
  return { ...Object.fromEntries(inherited), ...extra };
}

export const exec: Exec = (command, args, { cwd, env, input, inherit }) => {
  const shell = process.platform === 'win32' && command !== 'git';
  if (command !== 'git') shellLine(command, args);
  const options = {
    cwd,
    env: mergeEnv(env),
    input,
    encoding: 'utf8' as const,
    stdio: inherit ? ('inherit' as const) : ('pipe' as const),
  };
  const result = shell
    ? spawnSync(shellLine(command, args), { ...options, shell: true })
    : spawnSync(command, args, options);
  return { status: result.status ?? 1, stdout: result.stdout, stderr: result.stderr };
};
