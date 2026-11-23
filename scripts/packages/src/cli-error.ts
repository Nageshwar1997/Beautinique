// A failure the CLI reports to its user: a stable `code` to search for and a `hint` on what to do
// next. Anything else that is thrown is a bug and keeps its stack trace.
export class CliError extends Error {
  readonly code: string;
  readonly hint: string;

  constructor(code: string, message: string, hint: string) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.hint = hint;
  }
}
