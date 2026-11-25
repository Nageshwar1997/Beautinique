import { describe, expect, it } from 'vitest';
import { number, string } from 'zod';

import { defineEvent, EVENT_MAX_BYTES, eventEnvelopeSchema } from '../src/index.ts';

const orderPlaced = defineEvent({
  type: 'commerce.order.placed',
  version: 1,
  data: { orderId: string(), totalPaise: number().int().min(0) },
  description: 'A customer placed an order.',
});

const envelope = {
  eventId: 'evt_1',
  type: 'commerce.order.placed',
  version: 1,
  occurredAt: '2026-11-26T09:00:00.000Z',
  producer: 'commerce',
  aggregate: { type: 'order', id: '66f0a1b2c3d4e5f6a7b8c9d0', version: 3 },
  actor: { type: 'account', id: '66f0a1b2c3d4e5f6a7b8c9d1' },
  correlationId: 'corr_1',
  causationId: 'cause_1',
  data: { orderId: '66f0a1b2c3d4e5f6a7b8c9d0', totalPaise: 4900 },
};

describe('defineEvent', () => {
  it('SR-071: keeps the type, the version, the producer and an envelope for them', () => {
    expect(orderPlaced).toMatchObject({
      type: 'commerce.order.placed',
      version: 1,
      producer: 'commerce',
    });
    expect(Object.isFrozen(orderPlaced)).toBe(true);
    expect(orderPlaced.schema.safeParse(envelope).success).toBe(true);
  });

  it('SR-071: an event of another producer, type or version is refused', () => {
    expect(orderPlaced.schema.safeParse({ ...envelope, producer: 'catalog' }).success).toBe(false);
    expect(
      orderPlaced.schema.safeParse({ ...envelope, type: 'commerce.order.cancelled' }).success,
    ).toBe(false);
    expect(orderPlaced.schema.safeParse({ ...envelope, version: 2 }).success).toBe(false);
  });

  it('SR-071: the data has the fields of the event and no more, no less', () => {
    const data = envelope.data;
    expect(
      orderPlaced.schema.safeParse({ ...envelope, data: { ...data, note: 'x' } }).success,
    ).toBe(false);
    expect(
      orderPlaced.schema.safeParse({ ...envelope, data: { orderId: data.orderId } }).success,
    ).toBe(false);
    expect(
      orderPlaced.schema.safeParse({ ...envelope, data: { ...data, totalPaise: 49.5 } }).success,
    ).toBe(false);
  });

  it('SR-071: the envelope has no other field, and its parts have their form', () => {
    expect(orderPlaced.schema.safeParse({ ...envelope, extra: 1 }).success).toBe(false);
    expect(orderPlaced.schema.safeParse({ ...envelope, occurredAt: '26 Nov 2026' }).success).toBe(
      false,
    );
    expect(
      orderPlaced.schema.safeParse({ ...envelope, actor: { type: 'robot', id: 'x' } }).success,
    ).toBe(false);
    expect(
      orderPlaced.schema.safeParse({
        ...envelope,
        aggregate: { type: 'order', id: '', version: 0 },
      }).success,
    ).toBe(false);
    expect(orderPlaced.schema.safeParse({ ...envelope, correlationId: '' }).success).toBe(false);
  });

  it('SR-071: the plain envelope takes any data, for the dispatcher that has not yet found the event', () => {
    expect(eventEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expect(eventEnvelopeSchema.safeParse({ ...envelope, type: 'order.placed' }).success).toBe(
      false,
    );
    expect(eventEnvelopeSchema.safeParse({ ...envelope, producer: 'shop' }).success).toBe(false);
  });

  it('CR-12: the type is <service>.<aggregate>.<pastTense>, and the version a whole number from 1', () => {
    const make =
      (type: string, version = 1) =>
      () =>
        defineEvent({ type: type as never, version, data: {}, description: 'd' });

    expect(make('commerce.orderLine.delivered')).not.toThrow();
    expect(make('finance.creditNote.issued')).not.toThrow();
    for (const wrong of [
      'placed',
      'commerce.placed',
      'shop.order.placed',
      'commerce.Order.placed',
      'commerce.order.Placed',
      '',
    ]) {
      expect(make(wrong), wrong).toThrow('not <service>.<aggregate>.<pastTense>');
    }
    expect(make('commerce.order.placed', 0)).toThrow('whole number from 1');
    expect(make('commerce.order.placed', 1.5)).toThrow('whole number from 1');
  });

  it('SR-015, SR-054, SR-063, SR-077: a secret, a code or personal data never goes in the data', () => {
    for (const key of [
      'otp',
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'secret',
      'apiKey',
      'cookie',
      'deliveryCode',
      'pan',
      'bankAccount',
      'accountNumber',
      'address',
      'OTP',
      'Address',
    ]) {
      expect(
        () =>
          defineEvent({
            type: 'identity.account.created',
            version: 1,
            data: { [key]: string() },
            description: 'd',
          }),
        key,
      ).toThrow('never goes in an event');
    }
    // Ids of those things are fine: whoever needs more asks the owner.
    expect(() =>
      defineEvent({
        type: 'identity.account.created',
        version: 1,
        data: { accountId: string(), addressId: string() },
        description: 'd',
      }),
    ).not.toThrow();
  });
});

describe('EVENT_MAX_BYTES', () => {
  it('SR-071: an event is at most 16 KB', () => {
    expect(EVENT_MAX_BYTES).toBe(16_384);
  });
});
