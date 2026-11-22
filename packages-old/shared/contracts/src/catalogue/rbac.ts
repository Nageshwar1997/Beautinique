import { array, enum as zodEnum, object, string } from '@beautinique/shared-zod';

import { SCOPE_TYPES } from '../platform';

// The shapes of a role key and a scope (ARCHITECTURE §7.3), apart from the IAM routes: identity's
// GET /iam/me needs them too, and iam.ts imports identity.ts.

/** `<app>.<name>`: a shipped role, or `<app>.c_<name>` for one Master made. */
export const roleKeyZod = string()
  .max(80)
  .regex(/^[a-z]+\.[a-z][a-z0-9_]*$/, 'Not a role key');

/** Where a grant holds: a scope type and its ids (`global` has none). */
export const scopeZod = object({
  type: zodEnum(SCOPE_TYPES),
  ids: array(string().trim().min(1).max(64)).max(50),
});
