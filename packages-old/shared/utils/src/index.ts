export { type DateInput, formatDate, formatDateTime, formatTime, IST, istDateKey } from './dates';
export { uuidv7, uuidv7Time } from './id';
export {
  allocate,
  applyRate,
  discountPercent,
  formatINR,
  paiseToRupees,
  rupeesToPaise,
  type ShowPaise,
  taxFromInclusive,
} from './money';
export { formatNumber, initials, maskEmail, maskPhone, plural, slugify, truncate } from './text';

/** For exhaustive switches: a compile error when a case is missing, a runtime error if reached. */
export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

/** Throws when `condition` is false; narrows types after it. */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
