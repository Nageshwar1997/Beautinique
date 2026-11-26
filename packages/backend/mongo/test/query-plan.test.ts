import { describe, expect, it } from 'vitest';

import { planProblems } from '../src/query-plan.ts';

const explainOf = (winningPlan: unknown) => ({ queryPlanner: { winningPlan } });
const ixscan = { stage: 'IXSCAN', indexName: 'customer_placed' };

describe('planProblems: the guard of collection scans (docs/OPERATIONS.md §2 rule 6)', () => {
  it('RT-24: a plan that an index serves has no problem', () => {
    expect(
      planProblems('orders.byCustomer', explainOf({ stage: 'FETCH', inputStage: ixscan })),
    ).toEqual([]);
    expect(planProblems('orders.byId', explainOf({ stage: 'EXPRESS_IXSCAN' }))).toEqual([]);
    // A merge of two sorted index scans ($or) is not a sort in memory.
    expect(
      planProblems(
        'orders.page',
        explainOf({
          stage: 'LIMIT',
          inputStage: { stage: 'SORT_MERGE', inputStages: [ixscan, ixscan] },
        }),
      ),
    ).toEqual([]);
  });

  it('RT-24: a scan of the whole collection or a sort in memory is named, wherever it is in the plan', () => {
    expect(
      planProblems('orders.byNote', explainOf({ stage: 'COLLSCAN', filter: { note: 'x' } })),
    ).toEqual(['orders.byNote: reads the whole collection (COLLSCAN): give it an index.']);
    expect(
      planProblems(
        'orders.byTotal',
        explainOf({ stage: 'SORT', inputStage: { stage: 'FETCH', inputStage: ixscan } }),
      ),
    ).toEqual([
      'orders.byTotal: sorts in memory (SORT): give it an index in the order of its sort.',
    ]);
    // An $or with one branch on no index, in the slot based engine's shape, and a sort over it.
    expect(
      planProblems(
        'orders.either',
        explainOf({
          queryPlan: {
            stage: 'SORT',
            inputStage: {
              stage: 'OR',
              inputStages: [ixscan, { stage: 'COLLSCAN' }, { stage: 'COLLSCAN' }],
            },
          },
          slotBasedPlan: { stages: '[2] sort ... [1] scan s1 ...' },
        }),
      ),
    ).toEqual([
      'orders.either: reads the whole collection (COLLSCAN): give it an index.',
      'orders.either: sorts in memory (SORT): give it an index in the order of its sort.',
    ]);
  });

  it('RT-24: a collection that is not there, or an explain with no plan, is not taken as served', () => {
    expect(planProblems('orders.byCustomer', explainOf({ stage: 'EOF' }))).toEqual([
      'orders.byCustomer: the collection is not there; run the release step before the guard.',
    ]);
    expect(planProblems('orders.byCustomer', explainOf({ queryPlan: { stage: 'EOF' } }))).toEqual([
      'orders.byCustomer: the collection is not there; run the release step before the guard.',
    ]);
    expect(planProblems('orders.byCustomer', {})).toEqual([
      'orders.byCustomer: the explain has no winning plan.',
    ]);
  });

  it('CR-40: a plan 10^5 stages deep is read in one pass', () => {
    let plan: Record<string, unknown> = { stage: 'COLLSCAN' };
    for (let level = 0; level < 100_000; level += 1) plan = { stage: 'FETCH', inputStage: plan };

    expect(planProblems('deep', explainOf(plan))).toEqual([
      'deep: reads the whole collection (COLLSCAN): give it an index.',
    ]);
  });
});
