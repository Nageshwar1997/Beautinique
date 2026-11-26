import { BSON } from 'mongodb';

const INT32_MIN = -(2 ** 31);
const INT32_MAX = 2 ** 31 - 1;
const INT64_LIMIT = 2 ** 63;

// A number as canonical Extended JSON writes it (the smallest BSON integer that holds it exactly,
// or a double), without the cost of a call to it for each one.
function numberJson(value: number): string {
  if (Number.isInteger(value) && !Object.is(value, -0)) {
    if (value >= INT32_MIN && value <= INT32_MAX) return `{"$numberInt":"${String(value)}"}`;
    if (value >= -INT64_LIMIT && value <= INT64_LIMIT) return `{"$numberLong":"${String(value)}"}`;
  }
  return `{"$numberDouble":"${Object.is(value, -0) ? '-0.0' : String(value)}"}`;
}

const isPlainObject = (value: object): boolean => {
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * The same value always as the same text: the keys of an object in order, and a BSON value (an id,
 * a date, a `long`, a pattern) as its canonical Extended JSON. Lists keep their order. It walks the
 * value with a stack, not by calling itself, so a deep value does not overflow it.
 */
export function canonicalJson(value: unknown): string {
  const out: string[] = [];
  // Each item is a value to write, or a piece of text to write as it is.
  const stack: ({ text: string } | { value: unknown })[] = [{ value }];
  while (stack.length > 0) {
    const item = stack.pop() as { text: string } | { value: unknown };
    if ('text' in item) {
      out.push(item.text);
      continue;
    }
    const current = item.value;
    if (Array.isArray(current)) {
      const parts: ({ text: string } | { value: unknown })[] = [{ text: '[' }];
      (current as unknown[]).forEach((element, index) => {
        if (index > 0) parts.push({ text: ',' });
        parts.push({ value: element });
      });
      parts.push({ text: ']' });
      for (let index = parts.length - 1; index >= 0; index -= 1) stack.push(parts[index] as never);
    } else if (typeof current === 'object' && current !== null && isPlainObject(current)) {
      const entries = Object.entries(current)
        .filter(([, field]) => field !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
      const parts: ({ text: string } | { value: unknown })[] = [{ text: '{' }];
      entries.forEach(([name, field], index) => {
        parts.push({ text: `${index > 0 ? ',' : ''}${JSON.stringify(name)}:` });
        parts.push({ value: field });
      });
      parts.push({ text: '}' });
      for (let index = parts.length - 1; index >= 0; index -= 1) stack.push(parts[index] as never);
    } else if (current === undefined) {
      out.push('null');
    } else if (typeof current === 'string' || typeof current === 'boolean' || current === null) {
      // The same text as Extended JSON gives, without its cost.
      out.push(JSON.stringify(current));
    } else if (typeof current === 'number') {
      out.push(numberJson(current));
    } else {
      out.push(BSON.EJSON.stringify(current, { relaxed: false }));
    }
  }
  return out.join('');
}
