import type { ZodType } from 'zod';

import type { FieldIssue } from './errors.ts';

export type Decoded = { ok: true; value: unknown } | { ok: false; issues: readonly FieldIssue[] };

type Part = 'path' | 'query' | 'body';

const NUMBER_TEXT = /^-?\d+(\.\d+)?$/;

// The value that a schema asked for (`expected`), read from the text it came as: a number, a
// boolean or a date. Anything else stays as it is, and the schema refuses it.
function readText(value: unknown, expected: string): unknown {
  if (typeof value !== 'string') return value;
  if (expected === 'number' || expected === 'int') {
    return NUMBER_TEXT.test(value) ? Number(value) : value;
  }
  if (expected === 'boolean') {
    if (value === 'true') return true;
    return value === 'false' ? false : value;
  }
  if (expected === 'date') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date;
  }
  return value;
}

// An answer is as long as its first issues, not as long as the request that was refused (SR-007).
export const MAX_ISSUES = 20;

function issuesOf(part: Part, error: { issues: readonly IssueLike[] }): FieldIssue[] {
  return error.issues.slice(0, MAX_ISSUES).map((issue) => ({
    path: [part, ...issue.path.map(String)].join('.'),
    message: issue.message,
  }));
}

interface IssueLike {
  code: string;
  path: readonly PropertyKey[];
  message: string;
  expected?: unknown;
}

/** The input of a JSON body, checked with the schema of the route. */
export function decodeJson(schema: ZodType, body: unknown): Decoded {
  const result = schema.safeParse(body);
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, issues: issuesOf('body', result.error) };
}

// What a schema refused, read once more from the text it came as: a value that is text and was
// asked for as a number, a boolean, a date or a list (`ids=7` is a list of one). A list is
// copied once, however many of its items are read, so a long list costs one pass (CR-40). Gives
// `undefined` when nothing could be read.
function readIssues(
  candidate: Record<string, unknown>,
  issues: readonly IssueLike[],
): Record<string, unknown> | undefined {
  // The query is a flat object: a field, or an item of a list in a field.
  const fixed: Record<string, unknown> = { ...candidate };
  const copies = new Map<string, unknown[]>();
  let changed = false;
  for (const issue of issues) {
    const [key, index] = issue.path;
    if (issue.code !== 'invalid_type' || typeof key !== 'string' || issue.path.length > 2) continue;
    const expected = String(issue.expected);
    const current = fixed[key];
    if (issue.path.length === 1) {
      const read =
        expected === 'array' && typeof current === 'string'
          ? [current]
          : readText(current, expected);
      if (read !== current) {
        fixed[key] = read;
        changed = true;
      }
    } else if (Array.isArray(current) && typeof index === 'number') {
      let items = copies.get(key);
      if (items === undefined) {
        items = [...(current as unknown[])];
        copies.set(key, items);
        fixed[key] = items;
      }
      const read = readText(items[index], expected);
      if (read !== items[index]) {
        items[index] = read;
        changed = true;
      }
    }
  }
  return changed ? fixed : undefined;
}

// A field that is read from its text can make a list of one, whose item is then read from its
// text: so, at most, one pass for the field and one for the items.
const MAX_PASSES = 2;

/**
 * The input of the path or the query, checked with the schema of the route. These come as text
 * (`?limit=20`, `/orders/66f0`), and the client writes a number, a boolean, a date or a list the
 * same way (`buildRequest` of the contracts). So a field that the schema refuses because it wants
 * one of those, and that came as text, is read from its text and checked once more. A field that
 * does not read (`limit=abc`) stays refused, with the schema's own message.
 */
export function decodeText(schema: ZodType, part: 'path' | 'query', raw: unknown): Decoded {
  let candidate = raw as Record<string, unknown>;
  let result = schema.safeParse(candidate);
  for (let pass = 0; pass < MAX_PASSES && !result.success; pass += 1) {
    const fixed = readIssues(candidate, result.error.issues);
    if (fixed === undefined) break;
    candidate = fixed;
    result = schema.safeParse(candidate);
  }
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, issues: issuesOf(part, result.error) };
}
