/**
 * Expected failures are CliErrors: the CLI prints the message (and hint) and exits with `exitCode`.
 * Anything else is a bug and is printed with its stack.
 */
export class CliError extends Error {
  readonly code: string;
  readonly exitCode: number;
  readonly hint: string | undefined;

  constructor(message: string, options: { code?: string; exitCode?: number; hint?: string } = {}) {
    super(message);
    this.name = 'CliError';
    this.code = options.code ?? 'CLI_ERROR';
    this.exitCode = options.exitCode ?? 1;
    this.hint = options.hint;
  }
}

/** The user pressed Ctrl+C at a prompt or answered "no" to go on. */
export class CancelledError extends CliError {
  constructor(message = 'Cancelled. Nothing was changed.') {
    super(message, { code: 'CANCELLED', exitCode: 130 });
    this.name = 'CancelledError';
  }
}

export const isCliError = (error: unknown): error is CliError => error instanceof CliError;
