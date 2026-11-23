import { CliError } from './cli-error.ts';

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(error: unknown): void;
}

// Normal output goes to `out`, warnings and errors to `err`, so a script can read the plan from
// stdout and still see what went wrong.
export function createLogger(out: (line: string) => void, err: (line: string) => void): Logger {
  return {
    info: (message) => {
      out(message);
    },
    warn: (message) => {
      err(`warning: ${message}`);
    },
    error: (error) => {
      if (error instanceof CliError) {
        err(`error [${error.code}]: ${error.message}`);
        err(`  next: ${error.hint}`);
      } else {
        err(`error: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
      }
    },
  };
}
