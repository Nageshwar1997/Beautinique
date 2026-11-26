import { maskSensitiveText } from './mask-text.ts';

/** The most that is kept of the message of an error (docs/security/SECURITY_REQUIREMENTS.md SR-098). */
export const ERROR_MESSAGE_MAX = 300;
const STACK_MAX = 4000;
const FIELDS_MAX = 20;

export interface SerializedError {
  type: string;
  code?: string | number;
  message: string;
  stack?: string;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

// A validation error (zod's `issues`) says where, not what: the field names, never the values.
function validationMessage(issues: readonly unknown[]): string {
  const fields = issues.slice(0, FIELDS_MAX).map((issue) => {
    const path = (issue as { path?: unknown } | null)?.path;
    return Array.isArray(path) && path.length > 0 ? path.map(String).join('.') : '(value)';
  });
  return `Validation failed at ${[...new Set(fields)].join(', ')}`;
}

function messageOf(record: Readonly<Record<string, unknown>>): string {
  if (Array.isArray(record.issues)) return validationMessage(record.issues as unknown[]);
  return typeof record.message === 'string' ? record.message : '';
}

/**
 * An error as a log may show it: the type, the code, a short message with the patterns of SR-077
 * masked, and the stack. Nothing else of the error object, whatever it carries: not the request
 * config, the headers or the response of a failed call, not the `keyValue` of a database error
 * (SR-098). It is safe to apply twice, so a serialized error stays as it is.
 */
export function serializeError(value: unknown): SerializedError {
  if (typeof value !== 'object' || value === null) {
    return { type: 'NonError', message: maskSensitiveText(String(value), ERROR_MESSAGE_MAX) };
  }
  const record = value as Readonly<Record<string, unknown>>;
  const type = text(record.type) ?? text(record.name) ?? 'Error';
  const message = maskSensitiveText(messageOf(record), ERROR_MESSAGE_MAX);
  const serialized: SerializedError = { type, message };

  const code = record.code;
  if (typeof code === 'string' || (typeof code === 'number' && Number.isFinite(code))) {
    serialized.code = code;
  }

  const stack = text(record.stack);
  if (stack !== undefined) {
    // The first line of a stack is the message that the error had, so it is put in again from the
    // message above: a value that is masked in one place is masked in the other.
    const frames = stack.indexOf('\n    at ');
    const rest = frames === -1 ? '' : stack.slice(frames);
    serialized.stack = maskSensitiveText(`${type}: ${message}${rest}`, STACK_MAX);
  }
  return serialized;
}
