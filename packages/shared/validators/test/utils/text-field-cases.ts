import { expect, it } from 'vitest';
import { object, type ZodType } from 'zod';

import { refusals } from './refusals.ts';

// What every schema of this package answers to a value that is missing, empty or not text: the
// one message "<label> is required.", once. The messages of an array are left out: zod also runs
// its length checks on an array, so they would count twice.
export function itAnswersRequired(schema: ZodType, field: string, label: string): void {
  it(`AC-PLATFORM-13: ${field} that is missing, null, empty or not text says "${label} is required."`, () => {
    const required = [undefined, null, '', '   ', '\t\n', 5, 0, true, {}, new Date(0)];
    for (const value of required) {
      expect(refusals(schema, field, value), JSON.stringify(value)).toEqual([
        `${field}: ${label} is required.`,
      ]);
    }
    // The key is not in the object at all.
    const absent = object({ [field]: schema }).safeParse({});
    expect(
      absent.error?.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    ).toEqual([`${field}: ${label} is required.`]);
  });
}
