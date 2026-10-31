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
    name: 'server error with a non-JSON body is called INTERNAL',
    change: [["response.status >= 500 ? 'INTERNAL' : 'BAD_REQUEST'", "'INTERNAL'"]],
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
        "if (route.method !== 'GET' || route.access.type !== 'public') {",
        "if (route.access.type !== 'public') {",
      ],
    ],
    tests: 'wrong declarations',
  },
  {
    file: 'routes',
    name: 'a signed-in route may be cached',
    change: [
      [
        "if (route.method !== 'GET' || route.access.type !== 'public') {",
        "if (route.method !== 'GET') {",
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
    change: [['recoveryCodes: array(string()).length(10)', 'recoveryCodes: array(string())']],
    tests: 'recovery code',
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
];

export default mutations;
