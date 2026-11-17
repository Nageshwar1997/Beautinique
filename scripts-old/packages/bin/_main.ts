import { CancelledError, isCliError } from '../lib/errors.ts';
import { consoleLogger } from '../lib/log.ts';

/** Runs a command: expected failures print a message (+ hint) and set the exit code; bugs print a stack. */
export async function main(command: () => Promise<void>): Promise<void> {
  const log = consoleLogger();
  try {
    await command();
  } catch (error) {
    if (error instanceof CancelledError) {
      log.warn(error.message);
      process.exitCode = error.exitCode;
      return;
    }
    if (isCliError(error)) {
      if (error.exitCode === 0) {
        log.info(error.message);
      } else {
        log.error(error.message);
      }
      if (error.hint) {
        log.dim(error.hint);
      }
      process.exitCode = error.exitCode;
      return;
    }
    log.error('Unexpected error (a bug in the package CLI):');
    console.error(error);
    process.exitCode = 1;
  }
}

export { isTerminal } from '../lib/context.ts';
