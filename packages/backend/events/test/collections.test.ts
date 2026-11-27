import { defineCollections, leasesCollection } from '@beautinique/backend-mongo';
import { describe, expect, it } from 'vitest';

import { eventsCollections } from '../src/collections.ts';
import {
  DEAD_LETTER_TTL_SECONDS,
  deadLettersCollection,
  PROCESSED_EVENTS_TTL_SECONDS,
  processedEventsCollection,
} from '../src/inbox.ts';
import { OUTBOX_DONE_TTL_SECONDS, outboxCollection } from '../src/outbox.ts';
import { RETRY_WINDOW_MS } from '../src/retry.ts';
import { TIMER_DONE_TTL_SECONDS, timersCollection } from '../src/timers.ts';

const DAY = 24 * 60 * 60;
const ttlOf = (spec: typeof outboxCollection): number | undefined => {
  const expiry = spec.expiry;
  if (!('ttlIndex' in expiry)) return undefined;
  return spec.indexes.find((index) => index.name === expiry.ttlIndex)?.expireAfterSeconds;
};

describe('the platform collections of events and timers (docs/ARCHITECTURE.md §10.2)', () => {
  it('AC-PLATFORM-11: each has its class, its expiry and its account delete handler, and goes in a service plan', () => {
    const plan = defineCollections('commerce', [...eventsCollections, leasesCollection]);

    expect([...plan.specs.keys()].sort()).toEqual([
      'dead_letters',
      'leases',
      'outbox',
      'processed_events',
      'timers',
    ]);
    for (const spec of eventsCollections) {
      expect(spec.retention).toBe('tech');
      expect('ttlIndex' in spec.expiry).toBe(true);
      expect('none' in spec.accountDelete).toBe(true);
    }
  });

  it('AC-PLATFORM-11: the times of the table: outbox 7 days after delivered, inbox 14 days, dead letters 90 days after dealt with, timers 7 days after done', () => {
    expect(ttlOf(outboxCollection)).toBe(7 * DAY);
    expect(ttlOf(processedEventsCollection)).toBe(14 * DAY);
    expect(ttlOf(deadLettersCollection)).toBe(90 * DAY);
    expect(ttlOf(timersCollection)).toBe(7 * DAY);
    expect([
      OUTBOX_DONE_TTL_SECONDS,
      PROCESSED_EVENTS_TTL_SECONDS,
      DEAD_LETTER_TTL_SECONDS,
      TIMER_DONE_TTL_SECONDS,
    ]).toEqual([7 * DAY, 14 * DAY, 90 * DAY, 7 * DAY]);
  });

  it('AC-PLATFORM-3: the order of the TTLs (§10.2 rule 12): processed_events outlives the outbox purge and the longest retry', () => {
    // A redelivery can come as long as the outbox has the event: up to the longest retry, and
    // the outbox keeps a delivered event 7 days. The record that turns it away must be there longer.
    expect(PROCESSED_EVENTS_TTL_SECONDS * 1_000).toBeGreaterThan(
      OUTBOX_DONE_TTL_SECONDS * 1_000 + RETRY_WINDOW_MS,
    );
    expect((ttlOf(processedEventsCollection) ?? 0) * 1_000).toBeGreaterThan(
      (ttlOf(outboxCollection) ?? Number.POSITIVE_INFINITY) * 1_000 + RETRY_WINDOW_MS,
    );
  });
});
