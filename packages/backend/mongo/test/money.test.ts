import { paise } from '@beautinique/shared-money';
import { assert, integer, property } from 'fast-check';
import { BSON, Long } from 'mongodb';
import { describe, expect, it } from 'vitest';

import { MONEY_BSON_SCHEMA, moneyFromBson, moneyToBson } from '../src/money.ts';

describe('the money codec (docs/ARCHITECTURE.md §10.1 rule 5)', () => {
  it('SR-047: an amount is kept as a BSON long of paise, and read back the same', () => {
    const stored = moneyToBson(paise(129_999));

    expect(stored).toBeInstanceOf(Long);
    expect(stored.toNumber()).toBe(129_999);
    // What the server keeps: the BSON type is a long (0x12), not a double or an int.
    const bytes = BSON.serialize({ amount: stored });
    expect(bytes[4]).toBe(0x12);
    const read = BSON.deserialize(bytes, { promoteLongs: false })['amount'] as unknown;
    expect(read).toBeInstanceOf(Long);
    expect(moneyFromBson(read, 'amount')).toBe(129_999);
  });

  it('SR-047: what the driver gives for a long (a number, a Long or a bigint) is the same amount', () => {
    expect(moneyFromBson(4_999, 'price')).toBe(4_999);
    expect(moneyFromBson(Long.fromNumber(4_999), 'price')).toBe(4_999);
    expect(moneyFromBson(4_999n, 'price')).toBe(4_999);
    expect(moneyFromBson(0, 'price')).toBe(0);
    expect(moneyFromBson(Long.fromNumber(Number.MAX_SAFE_INTEGER), 'price')).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });

  it('SR-047, CR-22: what is not whole paise in the safe range is refused, with the field and never the value', () => {
    const notAmounts: unknown[] = [
      12.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      '1299',
      null,
      undefined,
      { amount: 1 },
      Number.MAX_SAFE_INTEGER + 1,
      Long.fromNumber(Number.MAX_SAFE_INTEGER).add(1),
      Long.fromNumber(Number.MIN_SAFE_INTEGER).subtract(1),
      BigInt(Number.MAX_SAFE_INTEGER) + 1n,
      BigInt(Number.MIN_SAFE_INTEGER) - 1n,
    ];
    for (const value of notAmounts) {
      expect(() => moneyFromBson(value, 'order.total'), String(value)).toThrow(
        'order.total must be an amount: a whole number of paise, kept as a BSON long.',
      );
    }
    expect(() => moneyToBson(12.5 as never)).toThrow(RangeError);
  });

  it('SR-047: any amount goes to MongoDB and back as itself (property)', () => {
    assert(
      property(integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }), (n) => {
        const bytes = BSON.serialize({ amount: moneyToBson(paise(n)) });
        const promoted = BSON.deserialize(bytes)['amount'] as unknown;
        const long = BSON.deserialize(bytes, { promoteLongs: false })['amount'] as unknown;
        const big = BSON.deserialize(bytes, { useBigInt64: true })['amount'] as unknown;
        expect(moneyFromBson(promoted, 'amount')).toBe(n);
        expect(moneyFromBson(long, 'amount')).toBe(n);
        expect(moneyFromBson(big, 'amount')).toBe(n);
      }),
    );
  });

  it('SR-047: the validator wants a long of 0 or more', () => {
    expect(MONEY_BSON_SCHEMA).toEqual({ bsonType: 'long', minimum: 0 });
  });
});
