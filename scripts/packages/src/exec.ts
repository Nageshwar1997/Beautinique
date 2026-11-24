import { spawnSync } from 'node:child_process';

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

// A shell takes one command line, so the arguments are quoted into it (passing an argument list
// to a shell is deprecated in Node).
function shellLine(command: string, args: string[]): string {
  const quote = (arg: string) =>
    /^[\w@%+=:,./-]+$/.test(arg) ? arg : `"${arg.replaceAll('"', '\\"')}"`;
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
