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
    change: [['if (callOptions?.signal?.aborted) throw error;', '']],
  },
  {
    file: 'client',
    name: 'error responses are treated as success',
    change: [['if (!response.ok) throw await failure(response);', '']],
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
];

export default mutations;
