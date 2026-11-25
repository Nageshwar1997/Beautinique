// Windows OpenSSH for every child process that runs `docker` or `ssh` (docs/OPERATIONS.md §1 rules 12
// to 16). The Docker context `bq-infra` (ssh://bq-infra) and the SSH tunnel both look `ssh` up on PATH.
// In Git Bash, Git's own ssh (C:\Program Files\Git\usr\bin) comes before Windows' own
// (C:\Windows\System32\OpenSSH), and it cannot reach the Windows ssh-agent where the key is loaded: it asks
// for a passphrase in a dialog, or fails with "Permission denied (publickey)". So on Windows these commands put
// Windows' OpenSSH first, whatever terminal they are started from. Everywhere else nothing changes.
import { existsSync } from 'node:fs';
import { win32 } from 'node:path';

// Windows' PATH separator, whichever platform the code runs on (the tests inject the platform).
const WINDOWS_DELIMITER = ';';

export interface WindowsOpenSsh {
  /** The folder of Windows' OpenSSH client, %SystemRoot%\System32\OpenSSH. */
  dir: string;
  /** Its ssh.exe. */
  exe: string;
}

// The key of `name` in `env`, whatever its case: a plain copy of process.env on Windows keeps the
// spelling of the system ("Path", "SystemRoot"), and its keys are case-sensitive.
function keyOf(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const wanted = name.toLowerCase();
  return Object.keys(env).find((key) => key.toLowerCase() === wanted);
}

// A PATH entry in the form Windows compares it: no quotes, one kind of slash, no trailing slash, any case.
function pathEntry(entry: string): string {
  return entry
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replaceAll('/', '\\')
    .replace(/\\+$/, '')
    .toLowerCase();
}

// Windows' own OpenSSH client; undefined on any other platform, without SystemRoot, or when it is not installed.
export function windowsOpenSsh(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  exists: (path: string) => boolean = existsSync,
): WindowsOpenSsh | undefined {
  if (platform !== 'win32') return undefined;
  const rootKey = keyOf(env, 'SystemRoot') ?? keyOf(env, 'windir');
  const root = rootKey === undefined ? undefined : env[rootKey];
  if (!root) return undefined;
  const dir = win32.join(root, 'System32', 'OpenSSH');
  const exe = win32.join(dir, 'ssh.exe');
  return exists(exe) ? { dir, exe } : undefined;
}

// The environment for a child process that runs docker or ssh: on Windows with its OpenSSH client
// installed, PATH starts with that client's folder (once, even if it was already somewhere in PATH);
// otherwise `env` itself, unchanged. PATH keeps the spelling it has in `env`.
export function sshEnv(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  exists: (path: string) => boolean = existsSync,
): NodeJS.ProcessEnv {
  const openSsh = windowsOpenSsh(env, platform, exists);
  if (!openSsh) return env;
  const pathKey = keyOf(env, 'PATH') ?? 'Path';
  const wanted = pathEntry(openSsh.dir);
  const entries = (env[pathKey] ?? '').split(WINDOWS_DELIMITER).filter((entry) => entry !== '');
  const [first = '', ...later] = entries;
  if (pathEntry(first) === wanted && !later.some((entry) => pathEntry(entry) === wanted))
    return env;
  const others = entries.filter((entry) => pathEntry(entry) !== wanted);
  return { ...env, [pathKey]: [openSsh.dir, ...others].join(WINDOWS_DELIMITER) };
}

// The program that opens the SSH tunnel: Windows' own ssh.exe by its full path, else `ssh` from PATH.
// The process still shows up as "ssh", which is what `infra:down` checks before it stops a tunnel.
export function sshCommand(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  exists: (path: string) => boolean = existsSync,
): string {
  return windowsOpenSsh(env, platform, exists)?.exe ?? 'ssh';
}
