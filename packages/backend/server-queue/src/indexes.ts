import type { IndexSpec } from '@beautinique/backend-server-mongo';

import { LOCK_INDEXES } from './lock';
import { STATE_INDEXES } from './recovery';
import { TASK_RUN_INDEXES } from './schedules';

/**
 * The indexes of the platform's records that have a name (leases, task runs, facts like the Redis
 * epoch): every document's _id is an ObjectId (owner, 2026-11-12), so the name is a unique field.
 * runRelease (@beautinique/backend-server-release) syncs them in every deployable by itself.
 */
export const PLATFORM_INDEXES: readonly IndexSpec[] = [
  ...LOCK_INDEXES,
  ...TASK_RUN_INDEXES,
  ...STATE_INDEXES,
];
