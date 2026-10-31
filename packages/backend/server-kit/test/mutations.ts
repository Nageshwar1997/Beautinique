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
    file: 'monitoring',
    name: 'span headers, IP and user kept',
    change: [['if (PRIVATE_ATTRIBUTE.test(key)) continue;', '']],
    tests: 'scrubSpan',
  },
  {
    file: 'monitoring',
    name: 'span URL keeps its query',
    change: [['? withoutQuery(value) : value', '? value : value']],
    tests: 'scrubSpan',
  },
  {
    file: 'monitoring',
    name: 'span name keeps its query',
    change: [['name: withoutQuery(span.name)', 'name: span.name']],
    tests: 'scrubSpan',
  },
  {
    file: 'monitoring',
    name: 'spans not scrubbed',
    change: [['beforeSendSpan: scrubSpan,', '']],
    tests: 'monitoring',
    survives:
      'dataCollection already keeps headers, queries and users out of spans; scrubSpan is the second lock (a probe with tracesSampleRate 1 found none of them in sent spans)',
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
  // tokens (T3.2 PR B)
  {
    file: 'tokens',
    name: 'a cookie found by part of its name',
    change: [['pair.slice(0, at).trim() === name', 'pair.slice(0, at).trim().includes(name)']],
    tests: 'cookieOf',
  },
  {
    file: 'tokens',
    name: 'JWKS never read again',
    change: [
      [
        'const stale = now() - loadedAt >= maxAgeMs;',
        'const stale = loadedAt === Number.NEGATIVE_INFINITY;',
      ],
    ],
    tests: 'jwksCache',
  },
  {
    file: 'tokens',
    name: 'JWKS read for every unknown key',
    change: [['!keys.has(kid) && now() - loadedAt >= minRefetchMs', '!keys.has(kid)']],
    tests: 'jwksCache',
  },
  {
    file: 'tokens',
    name: 'a failed read empties the keys',
    change: [
      [
        '  const reload = async () => {\n    loadedAt = now();',
        '  const reload = async () => {\n    keys = new Map();\n    loadedAt = now();',
      ],
    ],
    tests: 'jwksCache',
  },
  {
    file: 'tokens',
    name: 'passport for every owner',
    change: [['          aud: audience,', "          aud: 'bq:identity',"]],
    tests: 'passports',
  },
  {
    file: 'tokens',
    name: 'passport lives an hour',
    change: [['exp: iat + PASSPORT_SECONDS,', 'exp: iat + 3600,']],
    tests: 'passports',
  },
  {
    file: 'tokens',
    name: 'an old passport passes',
    change: [['        leewaySeconds: 5,', '        leewaySeconds: 600,']],
    tests: 'passports',
  },
  {
    file: 'tokens',
    name: 'unreadable keys taken for a bad passport',
    change: [
      [
        "      throw new AppError('SERVICE_UNAVAILABLE', 'Sign-in is not available right now.', {",
        "      throw new AppError('UNAUTHENTICATED', 'Sign-in is not available right now.', {",
      ],
    ],
    tests: '503',
  },
  {
    file: 'tokens',
    name: 'a JWKS error page taken for keys',
    change: [['if (response.status < 200 || response.status > 299) {', 'if (false) {']],
    tests: 'jwksFromUrl',
  },
  {
    file: 'tokens',
    name: 'a JWKS read waits for ever',
    change: [['signal: AbortSignal.timeout(JWKS_TIMEOUT_MS),', '']],
    tests: 'jwksFromUrl',
  },
  {
    file: 'tokens',
    name: 'axios throws its own error on a JWKS error page',
    change: [
      [
        `    validateStatus: () => true,
  });
  if (response.status < 200`,
        `  });
  if (response.status < 200`,
      ],
    ],
    tests: 'jwksFromUrl',
  },
];

export default mutations;
