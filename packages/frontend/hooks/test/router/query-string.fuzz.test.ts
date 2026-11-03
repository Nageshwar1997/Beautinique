import { describe, expect, it } from 'vitest';

import {
  buildSearch,
  normalizeSearch,
  parseParams,
  type StringRecord,
} from '../../src/router/query-string';

// Seeded random inputs (no extra dependency): the same seeds give the same inputs on every run, so a
// failure can be reproduced. The alphabets are small on purpose, so keys and values collide a lot.
const KEYS = [
  'a',
  'b',
  'c',
  'tag',
  'search',
  'q',
  'page',
  '2',
  '10',
  '1',
  'é',
  'a b',
  'x&y',
  'k=v',
];
const VALUES = [
  '',
  '1',
  '2',
  'abc',
  'lip gloss',
  ' lead',
  'trail ',
  'a&b=c',
  '100%',
  'a+b',
  '#hash',
  '?q',
  '/slash\\back',
  'लिपस्टिक',
  '😀 smile',
  'é',
];

const makeRandom = (seed: number) => {
  let state = seed * 2654435761 + 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

type TRandom = ReturnType<typeof makeRandom>;

const pick = <T>(random: TRandom, items: readonly T[]): T => {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('nothing to pick');
  return item;
};

/** A query string with repeated keys, blank values and keys that look like numbers. */
const randomSearch = (random: TRandom): string => {
  const params = new URLSearchParams();
  const count = Math.floor(random() * 7);

  for (let i = 0; i < count; i++) {
    params.append(pick(random, KEYS), pick(random, VALUES));
  }

  return random() < 0.5 ? `?${params.toString()}` : params.toString();
};

/** An update object: some keys, each set to a value (possibly blank). */
const randomUpdate = (random: TRandom): StringRecord => {
  const update: StringRecord = {};
  const count = Math.floor(random() * 4);

  for (let i = 0; i < count; i++) {
    update[pick(random, KEYS)] = pick(random, VALUES);
  }

  return update;
};

const SEEDS = Array.from({ length: 400 }, (_, index) => index + 1);

/** The keys of a query string in order of first appearance. */
const keyOrder = (search: string): string[] => [...new Set(new URLSearchParams(search).keys())];

describe('buildSearch (seeded random inputs)', () => {
  it('sets what the update sets, and leaves no blank value anywhere', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const search = randomSearch(random);
      const update = randomUpdate(random);

      const result = buildSearch(search, update);
      const parsed = parseParams(result);

      for (const [key, value] of Object.entries(update)) {
        if (value === '') {
          expect(
            parsed,
            `seed ${String(seed)}: ${search} + ${JSON.stringify(update)}`,
          ).not.toHaveProperty(key);
        } else {
          expect(parsed[key], `seed ${String(seed)}: ${search} + ${JSON.stringify(update)}`).toBe(
            value,
          );
          expect(new URLSearchParams(result).getAll(key)).toEqual([value]);
        }
      }

      for (const value of new URLSearchParams(result).values()) {
        expect(value, `seed ${String(seed)}`).not.toBe('');
      }
    }
  });

  it('keeps every value of the params it does not touch, in the same order', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const search = randomSearch(random);
      const update = randomUpdate(random);

      const result = new URLSearchParams(buildSearch(search, update));
      const before = new URLSearchParams(search);

      for (const key of new Set(before.keys())) {
        if (Object.hasOwn(update, key)) continue;

        expect(
          result.getAll(key),
          `seed ${String(seed)}: key ${JSON.stringify(key)} in ${search} + ${JSON.stringify(update)}`,
        ).toEqual(before.getAll(key).filter((value) => value !== ''));
      }
    }
  });

  it('keeps the params it does not touch in the order they had in the URL', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const search = randomSearch(random);
      const update = randomUpdate(random);

      const result = buildSearch(search, update);
      const untouchedBefore = keyOrder(search).filter((key) => !Object.hasOwn(update, key));
      const untouchedAfter = keyOrder(result).filter((key) => !Object.hasOwn(update, key));
      const survivors = untouchedBefore.filter((key) => untouchedAfter.includes(key));

      expect(untouchedAfter, `seed ${String(seed)}: ${search} + ${JSON.stringify(update)}`).toEqual(
        survivors,
      );
    }
  });

  it('does the same thing again when it is applied a second time', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const search = randomSearch(random);
      const update = randomUpdate(random);

      const once = buildSearch(search, update);

      expect(buildSearch(once, update), `seed ${String(seed)}`).toBe(once);
    }
  });

  it('writes a query string that is already in its canonical form', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const result = buildSearch(randomSearch(random), randomUpdate(random));

      expect(normalizeSearch(result), `seed ${String(seed)}`).toBe(result);
    }
  });

  it('treats an identity updater like an empty update (same params and values; only the order of keys like "2" may differ)', () => {
    // an updater gets a plain object back, and a JavaScript object lists keys like "2" first
    const byKey = (search: string) =>
      Object.fromEntries(
        [...new Set(new URLSearchParams(search).keys())].map((key) => [
          key,
          new URLSearchParams(search).getAll(key),
        ]),
      );

    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const search = randomSearch(random);

      expect(
        byKey(buildSearch(search, (params) => params)),
        `seed ${String(seed)}: ${search}`,
      ).toEqual(byKey(buildSearch(search, {})));
    }
  });

  it('removes every value of a key an updater leaves out, and touches nothing else', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const search = randomSearch(random);
      const removed = pick(random, KEYS);

      const result = new URLSearchParams(
        buildSearch(search, (params) =>
          Object.fromEntries(Object.entries(params).filter(([key]) => key !== removed)),
        ),
      );
      const before = new URLSearchParams(search);

      expect(result.has(removed), `seed ${String(seed)}: ${search} - ${removed}`).toBe(false);

      for (const key of new Set(before.keys())) {
        if (key === removed) continue;

        expect(result.getAll(key), `seed ${String(seed)}: key ${key} in ${search}`).toEqual(
          before.getAll(key).filter((value) => value !== ''),
        );
      }
    }
  });

  it('gets a value back exactly as it was set, whatever characters it has', () => {
    for (const seed of SEEDS) {
      const random = makeRandom(seed);
      const key = pick(random, KEYS);
      const value = pick(
        random,
        VALUES.filter((candidate) => candidate !== ''),
      );

      expect(parseParams(buildSearch('', { [key]: value }))[key], `seed ${String(seed)}`).toBe(
        value,
      );
    }
  });
});
