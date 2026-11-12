// Deliberate bugs for `npm run mutate -- --package shared-contracts` (RULES §6): each one must make
// a test fail, unless `survives` says why it cannot. This list covers the typed client, the codegen
// and the platform catalogue (T1.5); the older declare helpers are covered by index.test.ts.
// The runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  {
    file: 'client',
    name: 'null and undefined query values are sent',
    change: [['if (item === undefined || item === null) continue;', '']],
  },
  {
    file: 'client',
    name: 'dates are not sent as ISO strings',
    change: [['item instanceof Date ? item.toISOString() : String(item)', 'String(item)']],
  },
  {
    file: 'client',
    name: 'every answer that is not ours is called UPSTREAM_UNAVAILABLE',
    change: [
      [
        "UPSTREAM_DOWN.includes(response.status) ? 'UPSTREAM_UNAVAILABLE' : 'UNEXPECTED_RESPONSE'",
        "'UPSTREAM_UNAVAILABLE'",
      ],
    ],
    tests: 'a body that is not ours',
  },
  {
    file: 'client',
    name: 'no answer that is not ours is called UPSTREAM_UNAVAILABLE',
    change: [
      [
        "UPSTREAM_DOWN.includes(response.status) ? 'UPSTREAM_UNAVAILABLE' : 'UNEXPECTED_RESPONSE'",
        "'UNEXPECTED_RESPONSE'",
      ],
    ],
    tests: 'a body that is not ours',
  },
  {
    file: 'client',
    name: 'a 504 from the edge is not called UPSTREAM_UNAVAILABLE',
    change: [['[502, 503, 504]', '[502, 503]']],
    tests: 'a body that is not ours',
  },
  {
    file: 'client',
    name: 'token is never sent',
    change: [['if (token) headers.Authorization', 'if (false) headers.Authorization']],
  },
  {
    file: 'client',
    name: 'given idempotency key ignored',
    change: [['callOptions?.idempotencyKey ?? crypto.randomUUID()', 'crypto.randomUUID()']],
  },
  {
    file: 'client',
    name: 'abort is wrapped as NETWORK_ERROR',
    change: [['if (callOptions?.signal?.aborted) throw callOptions.signal.reason;', '']],
  },
  {
    file: 'client',
    name: 'error responses are treated as success',
    change: [['if (response.status < 200 || response.status > 299) throw failure(response);', '']],
  },
  {
    file: 'client',
    name: 'a redirect is treated as success',
    change: [['response.status > 299', 'response.status > 399']],
  },
  {
    file: 'client',
    name: 'axios throws on error statuses (they become NETWORK_ERROR)',
    change: [['validateStatus: () => true,', '']],
  },
  {
    file: 'client',
    name: 'a POST without a body is sent as a form',
    change: [["{ 'Content-Type': false }", '{}']],
  },
  {
    file: 'client',
    name: 'an answer is not told to onNetwork',
    change: [["options.onNetwork?.('answered');", '']],
  },
  {
    file: 'client',
    name: 'no answer is not told to onNetwork',
    change: [["options.onNetwork?.('unanswered');", '']],
  },
  {
    file: 'client',
    name: 'a given fetch is ignored',
    change: [["adapter: 'fetch', env: { fetch: options.fetch }", '']],
  },
  {
    file: 'client',
    name: 'missing data is accepted',
    change: [['if (data === undefined) {', 'if (false) {']],
  },
  {
    file: 'client',
    name: 'responses are never validated',
    change: [['const validate = options.validateResponses ?? true;', 'const validate = false;']],
  },
  {
    file: 'client',
    name: 'validateResponses false is ignored',
    change: [['options.validateResponses ?? true', 'true']],
  },
  {
    file: 'client',
    name: 'query key loses the module',
    change: [["route.id.split('.')[0] ?? route.id,", 'route.id,']],
  },
  {
    file: 'client',
    name: 'query key prefix ignores the route',
    change: [['routeId === undefined ? [module] : [module, routeId]', '[module]']],
  },
  {
    file: 'codegen',
    name: 'events are not sorted',
    change: [['.toSorted((a, b) => a.type.localeCompare(b.type) || a.version - b.version)', '']],
  },
  {
    file: 'codegen',
    name: 'permissions are not sorted',
    change: [['.toSorted((a, b) => a.key.localeCompare(b.key))', '']],
  },
  {
    file: 'codegen',
    name: 'output folder is not created',
    change: [['await mkdir(directory, { recursive: true });', '']],
  },
  {
    file: 'codegen',
    name: 'a changed file is not reported stale',
    change: [['if (current !== file.content) stale.push(file.name);', '']],
  },
  {
    file: 'catalogue/platform',
    name: 'record ping is not idempotent',
    change: [['  idempotency: true,', '  idempotency: false,']],
  },
  {
    file: 'catalogue/platform',
    name: 'ping note has no length limit',
    change: [['const noteZod = string().min(1).max(200);', 'const noteZod = string();']],
  },
  // route cache (M2 gateway, 2026-10-25): a cached answer must never be a personal one
  {
    file: 'routes',
    name: 'a non-GET route may be cached',
    change: [
      [
        "if (route.method !== 'GET' || route.access.type !== 'public') {\n      fail('only public GET routes can be cached');",
        "if (route.access.type !== 'public') {\n      fail('only public GET routes can be cached');",
      ],
    ],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'a signed-in route may be cached',
    change: [
      [
        "if (route.method !== 'GET' || route.access.type !== 'public') {\n      fail('only public GET routes can be cached');",
        "if (route.method !== 'GET') {\n      fail('only public GET routes can be cached');",
      ],
    ],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'sMaxAge 0 is accepted',
    change: [['sMaxAge < 1 ||', 'sMaxAge < 0 ||']],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'sMaxAge above the maximum is accepted',
    change: [['sMaxAge > MAX_S_MAX_AGE)', 'sMaxAge > MAX_S_MAX_AGE + 1)']],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'a negative stale window is accepted',
    change: [['      staleWhileRevalidate < 0 ||\n', '']],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'the maximum stale window is refused',
    change: [
      [
        'staleWhileRevalidate > MAX_STALE_WHILE_REVALIDATE\n',
        'staleWhileRevalidate >= MAX_STALE_WHILE_REVALIDATE\n',
      ],
    ],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'the gateway manifest loses the cache',
    change: [['cache: route.cache ? { ...route.cache } : null,', 'cache: null,']],
    tests: 'gateway manifest',
  },
  {
    file: 'openapi',
    name: 'OpenAPI x-bq loses the cache',
    change: [['cache: route.cache ? { ...route.cache } : null,', 'cache: null,']],
    tests: 'x-bq',
  },
  {
    file: 'catalogue/platform',
    name: 'record ping needs sign-in again',
    change: [
      [
        "  access: { type: 'public' },\n  rateLimit: 'write',",
        "  access: { type: 'signed-in' },\n  rateLimit: 'write',",
      ],
    ],
  },
  {
    file: 'catalogue/platform',
    name: 'wake needs sign-in (a sleeping app could never wake it)',
    change: [
      [
        "  access: { type: 'public' },\n  rateLimit: 'public',",
        "  access: { type: 'signed-in' },\n  rateLimit: 'public',",
      ],
    ],
  },
  {
    file: 'catalogue/platform',
    name: 'wake answered from the CDN cache',
    change: [
      [
        "  owner: 'core',\n  input: {},",
        "  owner: 'core',\n  cache: { sMaxAge: 60, staleWhileRevalidate: 0 },\n  input: {},",
      ],
    ],
  },
  {
    file: 'catalogue/identity',
    name: 'consent asked in no app',
    change: [['if (!(SIGN_UP_APPS as readonly string[]).includes(app)) return [];', 'return [];']],
    tests: 'sign-up app',
  },
  {
    file: 'catalogue/identity',
    name: 'terms not asked',
    change: [['if (consent?.terms !== true) {', 'if (false) {']],
    tests: 'sign-up app',
  },
  {
    file: 'catalogue/identity',
    name: '18 or older asked in every sign-up app',
    change: [
      ["if (app === 'customer' && consent?.adult !== true) {", 'if (consent?.adult !== true) {'],
    ],
    tests: 'sign-up app',
  },
  {
    file: 'catalogue/identity',
    name: 'delivery partners may sign up',
    change: [
      [
        "export const SIGN_UP_APPS = ['customer', 'seller', 'creator'] as const;",
        "export const SIGN_UP_APPS = ['customer', 'seller', 'creator', 'delivery'] as const;",
      ],
    ],
    tests: 'sign-in routes',
  },
  {
    file: 'catalogue/identity',
    name: 'an internal app without the authenticator',
    change: [["  'support',\n  'finance',", "  'finance',"]],
    tests: 'authenticator',
  },
  {
    file: 'catalogue/identity',
    name: 'new passwords without the rules',
    change: [
      [
        'body: object({ code: otpZod, password: passwordZod })',
        'body: object({ code: otpZod, password: string() })',
      ],
    ],
    tests: 'new password',
  },
  {
    file: 'catalogue/identity',
    name: 'recovery codes of any length',
    change: [['/^[A-Z2-7]{5}-?[A-Z2-7]{5}$/', '/^[A-Z2-7-]+$/']],
    tests: 'recovery code',
  },
  {
    file: 'catalogue/identity',
    name: 'recovery codes not upper-cased',
    change: [['  .trim()\n  .toUpperCase()\n', '  .trim()\n']],
    tests: 'recovery code',
  },
  {
    file: 'catalogue/identity',
    name: 'any number of recovery codes',
    change: [
      [
        'output: object({ user: signedInZod, recoveryCodes: array(string()).length(10) }),',
        'output: object({ user: signedInZod, recoveryCodes: array(string()) }),',
      ],
    ],
    tests: 'recovery code',
  },
  {
    file: 'catalogue/identity',
    name: 'any number of new recovery codes',
    change: [
      [
        "  summary: 'Get 10 new recovery codes',\n  apps: APPS,\n  access: { type: 'signed-in' },\n  rateLimit: 'auth',\n  idempotency: false,\n  stepUp: true,\n  owner: 'identity',\n  input: {},\n  output: object({ recoveryCodes: array(string()).length(10) }),",
        "  summary: 'Get 10 new recovery codes',\n  apps: APPS,\n  access: { type: 'signed-in' },\n  rateLimit: 'auth',\n  idempotency: false,\n  stepUp: true,\n  owner: 'identity',\n  input: {},\n  output: object({ recoveryCodes: array(string()) }),",
      ],
    ],
    tests: 'account’s password',
  },
  {
    file: 'catalogue/identity',
    name: 'no idle end for internal apps',
    change: [['  idleMs: 30 * 60_000,\n', '']],
    tests: 'sessions',
  },
  {
    file: 'catalogue/identity',
    name: 'customer sessions without the 90-day cap',
    change: [
      [
        'customer: { slidingMs: 30 * DAY_MS, maxMs: 90 * DAY_MS },',
        'customer: { slidingMs: 30 * DAY_MS, maxMs: 365 * DAY_MS },',
      ],
    ],
    tests: 'sessions',
  },
  {
    file: 'catalogue/identity',
    name: 'refresh cookie on every path',
    change: [
      [
        "export const REFRESH_COOKIE_PATH = '/api/v1/auth';",
        "export const REFRESH_COOKIE_PATH = '/';",
      ],
    ],
    tests: 'own host',
  },
  {
    file: 'platform',
    name: 'passport lives an hour',
    change: [['export const PASSPORT_SECONDS = 60;', 'export const PASSPORT_SECONDS = 3600;']],
    tests: 'passport',
  },
  {
    file: 'catalogue/identity',
    name: 'who signed in, answered to anyone',
    change: [
      [
        "  path: '/iam/me',\n  summary: 'Who is signed in, and this session',\n  apps: APPS,\n  access: { type: 'signed-in' },",
        "  path: '/iam/me',\n  summary: 'Who is signed in, and this session',\n  apps: APPS,\n  access: { type: 'public' },",
      ],
    ],
    tests: 'need a session',
  },
  // the signed-in authenticator (ARCHITECTURE §9.2)
  {
    file: 'routes',
    name: 'a public route may ask a step-up',
    change: [["if (route.stepUp && route.access.type === 'public') fail", 'if (false) fail']],
    tests: 'wrong declarations',
  },
  {
    file: 'catalogue/identity',
    name: 'new recovery codes without a step-up',
    change: [
      [
        "  path: '/auth/authenticator/recovery-codes',\n  summary: 'Get 10 new recovery codes',\n  apps: APPS,\n  access: { type: 'signed-in' },\n  rateLimit: 'auth',\n  idempotency: false,\n  stepUp: true,",
        "  path: '/auth/authenticator/recovery-codes',\n  summary: 'Get 10 new recovery codes',\n  apps: APPS,\n  access: { type: 'signed-in' },\n  rateLimit: 'auth',\n  idempotency: false,\n  stepUp: false,",
      ],
    ],
    tests: 'signed-in authenticator',
  },
  {
    file: 'catalogue/identity',
    name: 'set up without the password',
    change: [
      [
        'input: { body: object({ code: otpZod, password: currentPasswordZod }) },',
        'input: { body: object({ code: otpZod, password: currentPasswordZod.optional() }) },',
      ],
    ],
    tests: 'account’s password',
  },
  {
    file: 'catalogue/iam',
    name: 'a step-up with both proofs, or neither',
    change: [
      [
        'body: xor([\n      object({ code: otpZod, for: stepUpForZod }),\n      object({ recoveryCode: recoveryCodeZod, for: stepUpForZod }),\n    ]),',
        'body: object({\n      code: otpZod.optional(),\n      recoveryCode: recoveryCodeZod.optional(),\n      for: stepUpForZod,\n    }),',
      ],
    ],
    tests: 'never both or neither',
  },
  // navigation routes and social sign-in (T3.1 PR 4)
  {
    file: 'routes',
    name: 'a navigation route may be a POST or signed in',
    change: [
      [
        "    if (route.method !== 'GET' || route.access.type !== 'public') {\n      fail('a navigation route must be a public GET');",
        "    if (false) {\n      fail('a navigation route must be a public GET');",
      ],
    ],
    tests: 'a navigation route is a public GET',
  },
  {
    file: 'routes',
    name: 'a navigation route may be cached',
    change: [["if (route.cache) fail('a navigation route is never cached');", '']],
    tests: 'a navigation route is a public GET',
  },
  {
    file: 'routes',
    name: 'a navigation route may answer anything',
    change: [['if (route.output !== navigationZod) fail(', 'if (false) fail(']],
    tests: 'a navigation route is a public GET',
  },
  {
    file: 'routes',
    name: 'a redirect to //another-host passes',
    change: [['/^(?:\\/(?![/\\\\])\\S*|https:', '/^(?:\\/\\S*|https:']],
    tests: 'a navigation route is a public GET',
  },
  {
    file: 'routes',
    name: 'a redirect to any plain-http host passes',
    change: [['http:\\/\\/(?:localhost|127\\.0\\.0\\.1)', 'http:\\/\\/(?:[^/\\s]+)']],
    tests: 'a navigation route is a public GET',
  },
  {
    file: 'routes',
    name: 'the gateway never hears of navigation routes',
    change: [['    navigation: route.navigation === true,', '    navigation: false,']],
    tests: 'the gateway manifest',
  },
  {
    file: 'client',
    name: 'a navigation route can be called',
    change: [
      [
        '    if (route.navigation) {\n      throw new Error(',
        '    if (false) {\n      throw new Error(',
      ],
    ],
    tests: 'are links the browser opens',
  },
  {
    file: 'openapi',
    name: 'a navigation route asks for the app header',
    change: [['      ...(route.navigation\n        ? []', '      ...(false\n        ? []']],
    tests: 'describes a navigation route',
  },
  {
    file: 'openapi',
    name: 'a navigation route documented as { data }',
    change: [['        ...(route.navigation\n', '        ...(false\n']],
    tests: 'describes a navigation route',
  },
  {
    file: 'catalogue/social',
    name: 'next may leave for //another-host',
    change: [['/^\\/(?![/\\\\])[^', '/^\\/(?![\\\\])[^']],
    tests: 'no open redirect',
  },
  {
    file: 'catalogue/social',
    name: 'next may hold a space or a control character',
    change: [['[^\\s\\\\\\u0000-\\u001f\\u007f]*$/', '[^\\\\]*$/']],
    tests: 'no open redirect',
  },
  {
    file: 'catalogue/social',
    name: 'next of any length',
    change: [['next.length > maxLength || ', '']],
    tests: 'no open redirect',
  },
  {
    file: 'catalogue/social',
    name: 'the resolved path is not checked again (/..//host leaves the site)',
    change: [["return PATH_ONLY.test(path) ? path : '/';", 'return path;']],
    tests: 'no open redirect',
  },
  {
    file: 'catalogue/social',
    name: 'next is given back as typed, its dot segments not resolved',
    change: [
      ["return PATH_ONLY.test(path) ? path : '/';", "return PATH_ONLY.test(path) ? next : '/';"],
    ],
    tests: 'no open redirect',
  },
  {
    file: 'catalogue/social',
    name: 'a next that names another origin is kept',
    change: [["if (url.origin !== base) return '/';", '']],
    tests: 'no open redirect',
    survives:
      'PATH_ONLY lets only a path through (one / first), and a path always resolves on the same origin: the check stays as a second guard',
  },
  {
    file: 'catalogue/social',
    name: 'the caller’s longer limit is ignored',
    change: [['next.length > maxLength', 'next.length > 512']],
    tests: 'no open redirect',
  },
  // the refresh token's parts (identity finds the session, the gateway its `session` budget)
  {
    file: 'catalogue/identity',
    name: 'every token read as one from before families',
    change: [['family: parts.length === 3 && FAMILY.test(family) ? family : null', 'family: null']],
    tests: 'refresh token',
  },
  {
    file: 'catalogue/identity',
    name: 'any family text is taken',
    change: [['parts.length === 3 && FAMILY.test(family)', 'parts.length === 3']],
    tests: 'refresh token',
  },
  {
    file: 'catalogue/identity',
    name: 'a token of more parts is read',
    change: [['parts.length > 3 ||', '']],
    tests: 'refresh token',
  },
  {
    file: 'catalogue/identity',
    name: 'a session id alone is read',
    change: [['parts.length < 2 ||', '']],
    tests: 'refresh token',
  },
  {
    file: 'catalogue/identity',
    name: 'any session id is taken',
    change: [['!SESSION_ID.test(sessionId)', 'sessionId === ""']],
    tests: 'refresh token',
  },
  {
    file: 'catalogue/identity',
    name: 'the session id need not be a UUIDv7',
    change: [['[0-9a-f]{4}-7[0-9a-f]{3}-[89ab]', '[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]']],
    tests: 'refresh token',
  },
  {
    file: 'catalogue/identity',
    name: 'refresh and sign-out back in the sign-in class',
    change: [
      [
        "summary: 'Get a new access token with the refresh cookie',\n  apps: APPS,\n  access: { type: 'public' },\n  rateLimit: 'session',",
        "summary: 'Get a new access token with the refresh cookie',\n  apps: APPS,\n  access: { type: 'public' },\n  rateLimit: 'auth',",
      ],
    ],
    tests: 'refresh cookie only',
  },
];

export default mutations;
