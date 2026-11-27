import type { CollectionSpec } from '@beautinique/backend-mongo';

import { deadLettersCollection, processedEventsCollection } from './inbox.ts';
import { outboxCollection } from './outbox.ts';
import { timersCollection } from './timers.ts';

/**
 * The platform collections of this package (docs/ARCHITECTURE.md §10.2), for a service's
 * `defineCollections`, with `leasesCollection` of `@beautinique/backend-mongo` (the dispatcher's
 * and the ticker's leases are there).
 */
export const eventsCollections: readonly CollectionSpec[] = Object.freeze([
  outboxCollection,
  processedEventsCollection,
  deadLettersCollection,
  timersCollection,
]);
