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
  // monitoring (Sentry): one init per process, nothing personal sent, server errors only
  {
    file: 'monitoring',
    name: 'a second init replaces the first',
    change: [['if (Sentry.isInitialized()) return true;\n  if (dsn', 'if (dsn']],
    tests: 'monitoring',
  },
  {
    file: 'monitoring',
    name: 'a blank DSN starts Sentry',
    change: [["dsn === undefined || dsn.trim() === ''", 'dsn === undefined']],
    tests: 'monitoring',
  },
  {
    file: 'monitoring',
    name: 'what a request carried is sent',
    change: [['if (request) {', 'if (false) {']],
    tests: 'scrubEvent|monitoring',
  },
  {
    file: 'monitoring',
    name: 'the query stays in the URL',
    change: [['url: withoutQuery(request.url)', 'url: request.url']],
    tests: 'scrubEvent|monitoring',
  },
  {
    file: 'monitoring',
    name: 'no request id on the error',
    change: [["if (requestId !== undefined) scope.setTag('request_id', requestId);", '']],
    tests: 'monitoring',
  },
  {
    file: 'monitoring',
    name: 'errors not sent before exit',
    change: [['if (Sentry.isInitialized()) await Sentry.flush(timeoutMs);', '']],
    tests: 'monitoring',
  },
  {
    file: 'monitoring',
    name: 'Sentry collects headers again',
    change: [['httpHeaders: false,', 'httpHeaders: true,']],
    tests: 'monitoring',
    survives: 'beforeSend (scrubEvent) drops the headers anyway: the two guard each other',
  },
  {
    file: 'errors',
    name: 'server errors not reported',
    change: [['reportError(error, { requestId, method: req.method, path: req.path });', '']],
    tests: 'monitoring',
  },
  {
    file: 'errors',
    name: 'client errors reported too',
    change: [['if (status >= 500) {', 'if (status >= 400) {']],
    tests: 'monitoring',
  },
];

export default mutations;
