// Deliberate bugs for `npm run mutate -- --package shared-authz` (RULES §6): each one must make a
// test fail, unless `survives` says why it cannot. Keep this list in step with src/: the runner
// refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  // matcher: validity
  {
    file: 'matcher',
    name: 'grant still active at validTo',
    change: [['return from <= at && at < to;', 'return from <= at && at <= to;']],
  },
  {
    file: 'matcher',
    name: 'grant not active at validFrom',
    change: [['return from <= at && at < to;', 'return from < at && at < to;']],
  },
  {
    file: 'matcher',
    name: 'broken validity date accepted',
    change: [['if (Number.isNaN(from) || Number.isNaN(to)) {', 'if (false) {']],
  },
  // matcher: containment
  {
    file: 'matcher',
    name: 'broken location chain accepted',
    change: [['for (let i = 0; i < deepest; i += 1) {', 'for (let i = 0; i < 0; i += 1) {']],
  },
  {
    file: 'matcher',
    name: 'nearest wider place not required',
    change: [
      ['for (let i = 0; i < deepest; i += 1) {', 'for (let i = 0; i < deepest - 1; i += 1) {'],
    ],
  },
  {
    file: 'matcher',
    name: 'unknown scope type accepted',
    change: [['if (!(SCOPE_TYPES as readonly string[]).includes(scope.type)) {', 'if (false) {']],
  },
  {
    file: 'matcher',
    name: 'no resource does not count as anywhere',
    change: [
      [
        "if (scope.type === 'global' || resource === undefined) {",
        "if (scope.type === 'global') {",
      ],
    ],
  },
  {
    file: 'matcher',
    name: 'scope covers any id',
    change: [
      ['return id !== undefined && scope.ids.includes(id);', 'return scope.ids.length > 0;'],
    ],
  },
  // matcher: decisions
  {
    file: 'matcher',
    name: 'undeclared permission not an error',
    change: [['if (!definition) {', 'if (false) {']],
  },
  {
    file: 'matcher',
    name: 'no-grant reported as not-active',
    change: [['if (holding.length === 0) return', 'if (false) return']],
  },
  {
    file: 'matcher',
    name: 'inactive grant allowed',
    change: [
      [
        "if (active.length === 0) return { allowed: false, reason: 'not-active' };",
        'if (false) return { allowed: false, reason: "not-active" };',
      ],
    ],
  },
  {
    file: 'matcher',
    name: 'decide ignores allowed scope types',
    change: [
      [
        'const typed = active.filter((grant) => definition.scopeTypes.includes(grant.scope.type));',
        'const typed = active;',
      ],
    ],
  },
  {
    file: 'matcher',
    name: 'allowed with a grant that does not cover',
    change: [
      [
        'const grant = typed.find((g) => scopeCovers(g.scope, resource));',
        'const grant = typed[0];',
      ],
    ],
  },
  // matcher: scope specs
  {
    file: 'matcher',
    name: 'spec includes grants of other permissions',
    change: [['!grant.permissions.includes(permission) ||', 'false ||']],
  },
  {
    file: 'matcher',
    name: 'spec ignores allowed scope types',
    change: [['!definition.scopeTypes.includes(grant.scope.type) ||', 'false ||']],
  },
  {
    file: 'matcher',
    name: 'spec includes inactive grants',
    change: [['!isGrantActive(grant, now)', 'false']],
  },
  {
    file: 'matcher',
    name: 'spec never global',
    change: [["if (grant.scope.type === 'global') {", 'if (false) {']],
  },
  {
    file: 'matcher',
    name: 'spec forgets earlier grants of the same type',
    change: [
      [
        'new Set([...(spec.ids[grant.scope.type] ?? []), ...grant.scope.ids])',
        'new Set([...grant.scope.ids])',
      ],
    ],
  },
  {
    file: 'matcher',
    name: 'spec ids not sorted',
    change: [
      ['spec.ids[grant.scope.type] = [...list].sort();', 'spec.ids[grant.scope.type] = [...list];'],
    ],
  },
  {
    file: 'matcher',
    name: 'empty id lists reach something',
    change: [
      [
        'Object.values(spec.ids).some((ids) => ids.length > 0)',
        'Object.values(spec.ids).length > 0',
      ],
    ],
  },
  // matcher: step-up
  {
    file: 'matcher',
    name: 'no step-up time counts as fresh',
    change: [['if (!lastStepUpAt) return false;', 'if (!lastStepUpAt) return true;']],
  },
  {
    file: 'matcher',
    name: 'broken step-up time counts as fresh',
    change: [['if (Number.isNaN(at)) return false;', 'if (Number.isNaN(at)) return true;']],
  },
  {
    file: 'matcher',
    name: 'future step-up counts as fresh',
    change: [['return age >= 0 && age <= maxAgeMs;', 'return age <= maxAgeMs;']],
  },
  {
    file: 'matcher',
    name: 'step-up fresh a moment too long',
    change: [['return age >= 0 && age <= maxAgeMs;', 'return age >= 0 && age <= maxAgeMs + 1;']],
  },
  {
    file: 'matcher',
    name: 'step-up not fresh at exactly the limit',
    change: [['return age >= 0 && age <= maxAgeMs;', 'return age >= 0 && age < maxAgeMs;']],
  },
  // delegation: scope inside scope
  {
    file: 'delegation',
    name: 'outer scope type not checked',
    change: [['  assertKnownType(outer);\n', '']],
  },
  {
    file: 'delegation',
    name: 'inner scope type not checked',
    change: [['  assertKnownType(inner);\n', '']],
  },
  {
    file: 'delegation',
    name: 'a scope naming nothing is inside',
    change: [
      [
        "if (inner.type !== 'global' && inner.ids.length === 0) return false;",
        'if (false) return false;',
      ],
    ],
  },
  {
    file: 'delegation',
    name: 'global does not hold global',
    change: [["if (outer.type === 'global') return true;", 'if (false) return true;']],
  },
  {
    file: 'delegation',
    name: 'a narrower scope holds global',
    change: [["if (inner.type === 'global') return false;", 'if (false) return false;']],
  },
  {
    file: 'delegation',
    name: 'every scope type asks for a chain',
    change: [
      [
        'const isLocation = (LOCATION_SCOPES as readonly string[]).includes(type);',
        'const isLocation = true;',
      ],
    ],
  },
  {
    file: 'delegation',
    name: 'unknown place counts as inside',
    change: [
      [
        'place !== undefined && scopeCovers(outer, { ...place, [type]: id })',
        'scopeCovers(outer, { ...place, [type]: id })',
      ],
    ],
  },
  {
    file: 'delegation',
    name: 'lookup overrides the id being checked',
    change: [['{ ...place, [type]: id }', '{ [type]: id, ...place }']],
  },
  {
    file: 'delegation',
    name: 'one place outside is enough to fail',
    change: [['return inner.ids.every((id) => {', 'return inner.ids.some((id) => {']],
  },
  // delegation: grant problems
  {
    file: 'delegation',
    name: 'empty role allowed',
    change: [["if (grant.role.trim() === '') add(", 'if (false) add(']],
  },
  {
    file: 'delegation',
    name: 'role without permissions allowed',
    change: [['if (grant.permissions.length === 0) add(', 'if (false) add(']],
  },
  {
    file: 'delegation',
    name: 'repeated permission allowed',
    change: [['if (seen.has(key)) {', 'if (false) {']],
  },
  {
    file: 'delegation',
    name: 'unknown permission allowed',
    change: [['else add(\'permissions\', `Unknown permission "${key}"`);', 'else void 0;']],
  },
  {
    file: 'delegation',
    name: 'global scope with ids allowed',
    change: [["if (type === 'global' && ids.length > 0)", 'if (false)']],
  },
  {
    file: 'delegation',
    name: 'scope without ids allowed',
    change: [["if (type !== 'global' && ids.length === 0)", 'if (false)']],
  },
  {
    file: 'delegation',
    name: 'blank scope id allowed',
    change: [["if (ids.some((id) => id.trim() === ''))", 'if (false)']],
  },
  {
    file: 'delegation',
    name: 'repeated scope id allowed',
    change: [['if (new Set(ids).size !== ids.length)', 'if (false)']],
  },
  {
    file: 'delegation',
    name: 'scope type no permission can use allowed',
    change: [['if (known.length > 0 && !known.some(', 'if (false && !known.some(']],
  },
  {
    file: 'delegation',
    name: 'unknown permissions also blame the scope',
    change: [['if (known.length > 0 && !known.some(', 'if (!known.some(']],
  },
  {
    file: 'delegation',
    name: 'empty date string means no date',
    change: [
      [
        'if (value === null || value === undefined) return undefined;',
        'if (!value) return undefined;',
      ],
    ],
  },
  {
    file: 'delegation',
    name: 'valid-from and valid-to labels swapped',
    change: [
      [
        "name === 'validFrom' ? 'Valid-from' : 'Valid-to'",
        "name === 'validFrom' ? 'Valid-to' : 'Valid-from'",
      ],
    ],
  },
  {
    file: 'delegation',
    name: 'broken date not reported',
    change: [['if (Number.isNaN(at))\n      add(', 'if (false)\n      add(']],
  },
  {
    file: 'delegation',
    name: 'same start and end allowed',
    change: [['from >= to', 'from > to']],
  },
  {
    file: 'delegation',
    name: 'backwards dates allowed',
    change: [['from !== undefined && to !== undefined && from >= to', 'false']],
  },
  {
    file: 'delegation',
    name: 'broken date kept as a time',
    change: [['return Number.isNaN(at) ? undefined : at;', 'return at;']],
    survives:
      'equivalent: a NaN time makes `from >= to` false, so the "backwards" check stays quiet either way',
  },
  // separation of duties
  {
    file: 'separation',
    name: 'blank actor accepted',
    change: [["if (actorId.trim() === '') {", 'if (false) {']],
  },
  {
    file: 'separation',
    name: 'earlier step without a person accepted',
    change: [["if (step.by.trim() === '') {", 'if (false) {']],
  },
  {
    file: 'separation',
    name: 'ids compared ignoring case',
    change: [['step.by === actorId', 'step.by.toLowerCase() === actorId.toLowerCase()']],
  },
  {
    file: 'separation',
    name: 'ids compared ignoring spaces',
    change: [['step.by === actorId', 'step.by.trim() === actorId.trim()']],
  },
  {
    file: 'separation',
    name: 'last clash reported',
    change: [['earlier.find(', 'earlier.findLast(']],
  },
  {
    file: 'separation',
    name: 'same person allowed',
    change: [
      [
        "{ allowed: false, reason: 'same-person', conflictsWith: clash.as }",
        "{ allowed: true, reason: 'same-person', conflictsWith: clash.as }",
      ],
    ],
  },
  {
    file: 'separation',
    name: 'clash not named',
    change: [['conflictsWith: clash.as', 'conflictsWith: clash.by']],
  },
];

export default mutations;
