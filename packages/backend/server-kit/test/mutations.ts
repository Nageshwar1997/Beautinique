// Deliberate bugs for `npm run mutate -- --package backend-server-kit` (RULES §6): each one must
// make a test fail, unless `survives` says why it cannot. Keep this list in step with src/: the
// runner refuses a list whose `from` text no longer occurs exactly once. For now it covers
// mountRoute, the place where a request meets its contract.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  {
    file: 'route',
    name: 'params not checked',
    change: [['params: params?.parse(req.params),', 'params: req.params as never,']],
  },
  {
    file: 'route',
    name: 'query not checked',
    change: [['query: query?.parse(req.query),', 'query: req.query as never,']],
  },
  {
    file: 'route',
    name: 'body not checked',
    change: [['body: body?.parse(req.body),', 'body: req.body as never,']],
  },
  {
    file: 'route',
    name: 'every route answers to GET',
    change: [["router[route.method.toLowerCase() as Lowercase<Route['method']>](", 'router.get(']],
  },
  {
    file: 'route',
    name: 'broken output not noticed',
    change: [['if (!checked.success) {', 'if (false) {']],
  },
  {
    file: 'route',
    name: 'fields the contract does not name leak',
    change: [['.json({ data: checked.data });', '.json({ data: result });']],
  },
  {
    file: 'route',
    name: 'asked status ignored',
    change: [['options.status ?? 200', '200']],
  },
  {
    file: 'route',
    name: 'default status 201',
    change: [['options.status ?? 200', 'options.status ?? 201']],
  },
  {
    file: 'route',
    name: 'handler gets no request id',
    change: [['requestId: requestIdOf(res)', "requestId: ''"]],
  },
];

export default mutations;
