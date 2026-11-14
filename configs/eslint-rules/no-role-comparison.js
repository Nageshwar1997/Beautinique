// @ts-check
/**
 * no-role-comparison (RULES §3.5, TASKS T4.11): what someone may do comes from permissions and
 * scope (ARCHITECTURE §7.3), never from a role's name, so Master can make, change and retire
 * roles without a deploy. In shipped code (src/, app/) the rule reports:
 *
 * 1. a role key (`<app>.<name>` for one of the 11 apps: 'master.master', 'admin.c_desk_lead') or
 *    a role constant (`MASTER_ROLE`, `ROLE_ADMIN`) compared (===, !==, switch, includes/has/
 *    indexOf), or given to `holdsRole()`;
 * 2. a name that says role (`role`, `roleKey`, `grant.role`, `role.key`, `role.name`, `roles`)
 *    compared with a string: `role === 'MASTER'`.
 *
 * A comparison whose other side says it is something else (`purpose === 'seller.kyc_document'`,
 * a storage purpose) is not a role. There is no way to turn it off for a file: even identity's
 * seed and its first-Master command go by the seed's own constants (`MASTER_SEED`), not a lookup
 * by key. A role's rule of its own is a permission (`iam.totp.reset_master`, QA DR-007).
 */
import { EQUALITY, literalValue, membershipOf, pathOf, unwrap, wordsOf } from './ast.js';

/** The apps a role key starts with, as in packages/shared/contracts/src/platform.ts (a test keeps them equal). */
export const APPS = [
  'customer',
  'seller',
  'admin',
  'superadmin',
  'master',
  'support',
  'finance',
  'logistics',
  'delivery',
  'growth',
  'creator',
];

const ROLE_KEY = new RegExp(`^(?:${APPS.join('|')})\\.(?:c_)?[a-z][a-z0-9_]*$`);

/** True for a string shaped like a role key: 'master.master', 'logistics.c_night_lead'. */
export const isRoleKey = (/** @type {string} */ text) => ROLE_KEY.test(text);

/** True for a role constant's name: MASTER_ROLE, ROLE_ADMIN, STATE_ADMIN_ROLES. */
export const isRoleConstant = (/** @type {string} */ name) =>
  /^[A-Z][A-Z0-9_]*$/.test(name) && name.split('_').some((word) => /^ROLES?$/.test(word));

/** Words that only say which part of a role a name holds. */
const QUALIFIERS = new Set(['key', 'keys', 'name', 'names', 'id', 'ids']);

/** Last words that say a value is something other than a role, though shaped like a key. */
const OTHER_KINDS = new Set([
  'purpose',
  'kind',
  'type',
  'event',
  'topic',
  'path',
  'route',
  'permission',
  'setting',
]);

/**
 * Does the expression's name say it holds a role? `role`, `roles`, `roleKey`, `roleNames`,
 * `grant.role`, `role.key`, `held.role.name`.
 * @param {any} node
 * @returns {boolean}
 */
export function namesRole(node) {
  const path = pathOf(node);
  if (path === null || path.length === 0) {
    return false;
  }
  const words = wordsOf(path.at(-1) ?? '');
  const last = words.at(-1);
  if (last === 'role' || last === 'roles') {
    return true;
  }
  if (last === undefined || !QUALIFIERS.has(last)) {
    return false;
  }
  if (words.length > 1) {
    const before = words.at(-2);
    return before === 'role' || before === 'roles';
  }
  // role.key, grant.role.name: the part before names the role
  const parent = path.at(-2);
  return parent !== undefined && ['role', 'roles'].includes(wordsOf(parent).at(-1) ?? '');
}

/**
 * Does the expression's name say it holds something else (a purpose, a type)?
 * @param {any} node
 * @returns {boolean}
 */
function namesOtherKind(node) {
  const path = pathOf(node);
  const last = path === null ? undefined : wordsOf(path.at(-1) ?? '').at(-1);
  return last !== undefined && OTHER_KINDS.has(last.replace(/s$/, ''));
}

/**
 * What makes the expression a role on its own: 'key' for a role key, 'constant' for a role
 * constant, or null.
 * @param {any} node
 * @returns {'key' | 'constant' | null}
 */
function roleValue(node) {
  const found = literalValue(node);
  if (found !== null) {
    return typeof found.value === 'string' && isRoleKey(found.value) ? 'key' : null;
  }
  const current = unwrap(node);
  return current?.type === 'Identifier' && isRoleConstant(current.name) ? 'constant' : null;
}

/** @type {import('eslint').Rule.RuleModule} */
export const noRoleComparison = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Decide by permission and scope, never by the name of a role (RULES §3.5, ARCHITECTURE §7.3).',
    },
    schema: [],
    messages: {
      compared:
        '`{{what}}` is a role: check a permission and its scope instead (requirePermission, usePermission, <Can>): roles are data Master changes without a deploy (RULES §3.5).',
      holdsRole:
        '`holdsRole` with a fixed role decides by its name: check a permission and its scope instead (RULES §3.5).',
    },
  },
  create(context) {
    const source = context.sourceCode;

    /**
     * One side of a check against the other: reports the side that is a role.
     * @param {any} side
     * @param {any} other
     */
    function check(side, other) {
      const value = roleValue(side);
      const byName = value === null && namesRole(other) && literalValue(side) !== null;
      if (value === null && !byName) {
        return;
      }
      // a storage purpose or an event type shaped like a key is not a role
      if (value === 'key' && namesOtherKind(other)) {
        return;
      }
      context.report({
        node: side,
        messageId: 'compared',
        data: { what: source.getText(side) },
      });
    }

    return {
      /** @param {any} node */
      BinaryExpression(node) {
        if (EQUALITY.has(node.operator)) {
          check(node.right, node.left);
          check(node.left, node.right);
        }
      },
      /** @param {any} node */
      SwitchStatement(node) {
        for (const switchCase of node.cases) {
          if (switchCase.test) {
            check(switchCase.test, node.discriminant);
          }
        }
      },
      /** @param {any} node */
      CallExpression(node) {
        const asked = membershipOf(node);
        if (asked) {
          check(asked.value, asked.list);
          return;
        }
        const callee = unwrap(node.callee);
        const name =
          callee?.type === 'Identifier'
            ? callee.name
            : callee?.type === 'MemberExpression' && !callee.computed
              ? callee.property.name
              : null;
        const role = node.arguments[1];
        if (name === 'holdsRole' && role && (literalValue(role) !== null || roleValue(role))) {
          context.report({ node: role, messageId: 'holdsRole' });
        }
      },
    };
  },
};
