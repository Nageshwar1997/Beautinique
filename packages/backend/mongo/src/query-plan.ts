import type { Collection, Document } from 'mongodb';

/** A query of a repository, as the guard runs it: the shape of its filter, sort and projection. */
export interface QueryShape {
  /** What the repository calls it, for the message: `orders.byCustomer`. */
  name: string;
  filter: Document;
  sort?: Document;
  projection?: Document;
  limit?: number;
}

// The stages a query must not have (docs/ARCHITECTURE.md §10.4 rule 8, docs/OPERATIONS.md §2 rule 6).
const BAD_STAGES = new Map([
  ['COLLSCAN', 'reads the whole collection (COLLSCAN): give it an index'],
  ['SORT', 'sorts in memory (SORT): give it an index in the order of its sort'],
]);

/**
 * What is wrong with a query's plan (the result of `explain`): each stage that reads the whole
 * collection or sorts in memory, wherever it is in the plan (the classic plan and the slot based
 * engine's `queryPlan` alike), and a plan on a collection that is not there. It walks the plan with
 * a stack, so a plan of any depth is read in one pass.
 */
export function planProblems(name: string, explain: Document): string[] {
  const planner = explain['queryPlanner'] as Document | undefined;
  const winning = planner?.['winningPlan'] as Document | undefined;
  if (winning === undefined) return [`${name}: the explain has no winning plan.`];
  const top = (winning['queryPlan'] ?? winning) as Document;
  if (top['stage'] === 'EOF' && top['inputStage'] === undefined) {
    return [`${name}: the collection is not there; run the release step before the guard.`];
  }
  const found = new Set<string>();
  const stack: unknown[] = [winning];
  while (stack.length > 0) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      for (const item of node as unknown[]) stack.push(item);
    } else if (typeof node === 'object' && node !== null) {
      const stage: unknown = (node as Record<string, unknown>)['stage'];
      if (typeof stage === 'string' && BAD_STAGES.has(stage)) found.add(stage);
      for (const value of Object.values(node)) {
        if (typeof value === 'object' && value !== null) stack.push(value);
      }
    }
  }
  return [...found].sort().map((stage) => `${name}: ${String(BAD_STAGES.get(stage))}.`);
}

/**
 * The guard of one repository query (§10.4 rule 8): its `explain` on the real database, after the
 * release step made the indexes, and what is wrong with its plan. The CI runs it for every query a
 * repository lists; an empty list is a query that an index serves.
 */
export async function queryPlanProblems(
  collection: Collection,
  query: QueryShape,
): Promise<string[]> {
  const explain = await collection
    .find(query.filter, {
      ...(query.sort === undefined ? {} : { sort: query.sort }),
      ...(query.projection === undefined ? {} : { projection: query.projection }),
      ...(query.limit === undefined ? {} : { limit: query.limit }),
    })
    .explain('queryPlanner');
  return planProblems(query.name, explain);
}
