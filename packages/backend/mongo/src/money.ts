import { paise, type Paise } from '@beautinique/shared-money';
import { Long } from 'mongodb';

/**
 * The `$jsonSchema` of an amount in a validator: a BSON `long` of 0 or more (docs/ARCHITECTURE.md
 * §10.1 rule 5, §10.4 rule 7). A plain JavaScript number is kept as an `int` or a `double`, so the
 * validator turns away an amount written without `moneyToBson`.
 */
export const MONEY_BSON_SCHEMA = { bsonType: 'long', minimum: 0 } as const;

/** An amount as MongoDB keeps it: a BSON `long` of paise. */
export function moneyToBson(amount: Paise): Long {
  return Long.fromNumber(paise(amount));
}

const notAmount = (field: string): RangeError =>
  new RangeError(`${field} must be an amount: a whole number of paise, kept as a BSON long.`);

/**
 * An amount read from MongoDB. The driver gives a `long` as a number when it fits (its default), a
 * `Long` or a `bigint` otherwise; each is checked to be whole paise in the safe range. `field` names
 * it in the error, which never has the value (docs/RULES.md CR-22).
 */
export function moneyFromBson(value: unknown, field: string): Paise {
  let amount: number;
  if (value instanceof Long) {
    if (value.greaterThan(Number.MAX_SAFE_INTEGER) || value.lessThan(Number.MIN_SAFE_INTEGER)) {
      throw notAmount(field);
    }
    amount = value.toNumber();
  } else if (typeof value === 'bigint') {
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw notAmount(field);
    }
    amount = Number(value);
  } else if (typeof value === 'number' && Number.isSafeInteger(value)) {
    amount = value;
  } else {
    throw notAmount(field);
  }
  return paise(amount);
}
