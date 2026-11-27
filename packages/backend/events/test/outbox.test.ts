import type { ClientSession, Db } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

import { createOutbox } from '../src/outbox.ts';
import { aboutOrder, clockAt, orderPlaced, paymentCaptured } from './utils/fixtures.ts';

// A database and a session that only say what was asked of them: the checks before any write.
function fakeDb(): { db: Db; insertOne: ReturnType<typeof vi.fn> } {
  const insertOne = vi.fn(() => Promise.resolve({ acknowledged: true }));
  const db = { collection: () => ({ insertOne }) } as unknown as Db;
  return { db, insertOne };
}
const session = (inTransaction: boolean) =>
  ({ inTransaction: () => inTransaction }) as unknown as ClientSession;

describe('the outbox of a producer (docs/ARCHITECTURE.md §3 rules 1, 2, 7 and 8)', () => {
  const subscriptions = { 'commerce.order.placed': ['payments', 'notify'] };

  it('AC-PLATFORM-2: an event outside a transaction is refused, and nothing is written', async () => {
    const outbox = createOutbox({ service: 'commerce', subscriptions, clock: clockAt() });
    const { db, insertOne } = fakeDb();

    await expect(
      outbox.append(db, session(false), orderPlaced, aboutOrder('A', 1)),
    ).rejects.toThrow(
      'The event commerce.order.placed must be written in the transaction of its change.',
    );
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('SR-071: an event of another producer is refused', async () => {
    const outbox = createOutbox({ service: 'commerce', subscriptions, clock: clockAt() });
    const { db, insertOne } = fakeDb();

    await expect(
      outbox.append(db, session(true), paymentCaptured, {
        ...aboutOrder('A', 1),
        data: { paymentId: 'P' },
      }),
    ).rejects.toThrow('The event payments.payment.captured is of payments, not commerce.');
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('SR-077: an event that does not match its contract is refused with the fields, never their values', async () => {
    const outbox = createOutbox({ service: 'commerce', subscriptions, clock: clockAt() });
    const { db, insertOne } = fakeDb();
    const event = aboutOrder('A', 1);

    const refused = outbox.append(db, session(true), orderPlaced, {
      ...event,
      data: { orderId: 'secret-value-42', lines: 'many' as unknown as number },
    });

    await expect(refused).rejects.toThrow(
      /^The event commerce.order.placed is not right: lines must be a number\.$/,
    );
    await expect(refused).rejects.not.toThrow(/secret-value-42/);
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('AC-PLATFORM-2: an event bigger than 16 KB is refused (§3 rule 7)', async () => {
    const outbox = createOutbox({ service: 'commerce', subscriptions, clock: clockAt() });
    const { db } = fakeDb();
    const event = aboutOrder('A', 1);

    await expect(
      outbox.append(db, session(true), orderPlaced, {
        ...event,
        data: { orderId: 'A'.repeat(17_000), lines: 1 },
      }),
    ).rejects.toThrow('The event commerce.order.placed is more than 16384 bytes');
  });

  it('SR-071: subscriptions are checked at boot: an event of another service, a wrong or twice given subscriber', () => {
    const clock = clockAt();
    expect(() =>
      createOutbox({
        service: 'commerce',
        subscriptions: { 'payments.payment.captured': ['finance'] },
        clock,
      }),
    ).toThrow(
      'The event payments.payment.captured is not of commerce, so commerce cannot send it.',
    );
    expect(() =>
      createOutbox({
        service: 'commerce',
        subscriptions: { 'commerce.order.placed': ['shop'] },
        clock,
      }),
    ).toThrow(
      'The subscriber shop is not <service> or <service>.<name>, with a service of the list.',
    );
    expect(() =>
      createOutbox({
        service: 'commerce',
        subscriptions: { 'commerce.order.placed': ['Finance'] },
        clock,
      }),
    ).toThrow(RangeError);
    expect(() =>
      createOutbox({
        service: 'commerce',
        subscriptions: { 'commerce.order.placed': ['notify', 'notify'] },
        clock,
      }),
    ).toThrow('The subscriber notify of commerce.order.placed is given twice.');
    expect(() =>
      createOutbox({
        service: 'commerce',
        subscriptions: { 'commerce.order.placed': ['catalog.reviews', 'catalog'] },
        clock,
      }),
    ).not.toThrow();
  });
});
