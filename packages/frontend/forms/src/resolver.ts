import type { input, output, ZodType } from '@beautinique/shared-zod';
import { type FieldErrors, type FieldValues, type Resolver, set } from 'react-hook-form';

/**
 * A react-hook-form resolver for one of our zod schemas (`...Zod` from @beautinique/shared-zod):
 * the form gets the schema's output (trimmed, lower-cased ... as the schema says), and each field
 * its first message. Ours rather than `@hookform/resolvers`, so zod comes only through shared-zod.
 */
export function zodResolver<Schema extends ZodType<FieldValues, FieldValues>>(
  schema: Schema,
): Resolver<input<Schema>, unknown, output<Schema>> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };
    const errors: FieldErrors<input<Schema>> = {};
    const seen = new Set<string>();
    for (const issue of result.error.issues) {
      const name = issue.path.map(String).join('.');
      // the first problem of a field is the one to fix first
      if (seen.has(name)) continue;
      seen.add(name);
      set(errors, name === '' ? 'root' : name, { type: issue.code, message: issue.message });
    }
    return { values: {}, errors };
  };
}
