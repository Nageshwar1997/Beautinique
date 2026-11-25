import { z } from 'zod';

/**
 * Why `schema` refuses `value`, as one `field: message` text per reason, with the schema used as
 * a field of an object the way a contract uses it. Empty when the value is accepted.
 */
export function refusals(schema: z.ZodType, field: string, value: unknown): string[] {
  const result = z.object({ [field]: schema }).safeParse({ [field]: value });
  if (result.success) return [];
  return result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}
