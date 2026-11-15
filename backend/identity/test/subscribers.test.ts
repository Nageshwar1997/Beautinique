// LIVE-006: identity's outbox relay sends on only the event types it has an entry for, and leaves
// any other pending for an instance that knows it. So every type identity writes is in its routes,
// an empty list too, or its events would wait for ever.
import { events } from '@beautinique/shared-contracts';
import { describe, expect, it } from 'vitest';

import { SUBSCRIBERS } from '../src/runtime.ts';

describe("identity's event routes", () => {
  it('name every event type identity writes, and only those', () => {
    const written = [
      ...new Set(
        events
          .all()
          .filter((event) => event.producer === 'identity')
          .map((event) => event.type),
      ),
    ].sort();
    expect(Object.keys(SUBSCRIBERS).sort()).toEqual(written);
  });
});
