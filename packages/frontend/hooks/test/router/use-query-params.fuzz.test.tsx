import { act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import { buildSearch, normalizeSearch, type StringRecord } from '../../src/router/query-string';
import { setupQueryParams } from '../utils/query-params-harness';

// Random updates from two components, with navigations held back and let through at random, must end
// up as exactly the URL you get by applying the same updates one after another. The model below is
// plain `buildSearch` on a string: it knows nothing about routers, pending navigations or re-renders.
const KEYS = ['status', 'search', 'page', 'sort', 'tag'];
const VALUES = ['', 'a', 'b', 'lip gloss', '1'];
const STARTS = [
  '/products',
  '/products?sort=name',
  '/products?tag=a&tag=b&page=2',
  '/products?search=',
];

const makeRandom = (seed: number) => {
  let state = seed * 2654435761 + 7;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

type TRandom = ReturnType<typeof makeRandom>;

const pick = <T,>(random: TRandom, items: readonly T[]): T => {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('nothing to pick');
  return item;
};

const randomParams = (random: TRandom): StringRecord => {
  const params: StringRecord = {};
  const count = 1 + Math.floor(random() * 2);

  for (let i = 0; i < count; i++) {
    params[pick(random, KEYS)] = pick(random, VALUES);
  }

  return params;
};

const nextPage = (previous: StringRecord): StringRecord => ({
  ...previous,
  page: String('page' in previous ? Number(previous.page) + 1 : 1),
});

describe('useQueryParams with random updates from two components (data router)', () => {
  afterEach(() => {
    resetPendingSearch();
  });

  it.each(Array.from({ length: 40 }, (_, index) => index + 1))(
    'seed %i: ends up as the updates applied one after another',
    async (seed) => {
      const random = makeRandom(seed);
      const start = pick(random, STARTS);
      const { router, query, other, rerender, settled, gate } = setupQueryParams(start);
      await settled();

      let expected = start.split('?')[1] ?? '';
      const log: string[] = [];

      for (let step = 0; step < 14; step++) {
        const hook = random() < 0.5 ? query() : other();
        const kind = random();

        act(() => {
          if (kind < 0.55) {
            const params = randomParams(random);
            log.push(`set ${JSON.stringify(params)}`);
            expected = buildSearch(expected, params);
            hook.setParams(params);
          } else if (kind < 0.8) {
            const keys = [pick(random, KEYS), pick(random, KEYS)];
            log.push(`remove ${JSON.stringify(keys)}`);
            expected = buildSearch(expected, (previous) =>
              Object.fromEntries(Object.entries(previous).filter(([key]) => !keys.includes(key))),
            );
            hook.removeParams(keys);
          } else if (kind < 0.9) {
            log.push('clear');
            expected = '';
            hook.clearParams();
          } else {
            log.push('page + 1 (updater)');
            expected = buildSearch(expected, nextPage);
            hook.setParams(nextPage);
          }
        });

        // what happens in between: a re-render, a navigation held back or let through, a tick
        const between = random();

        if (between < 0.2) {
          act(() => {
            rerender();
          });
        } else if (between < 0.4) {
          gate.hold();
        } else if (between < 0.55) {
          gate.release();
        } else if (between < 0.7) {
          await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
          });
        }
      }

      gate.release();
      await settled();

      expect(
        normalizeSearch(router.state.location.search),
        `start ${start}\n${log.join('\n')}`,
      ).toBe(normalizeSearch(expected));
    },
  );
});
