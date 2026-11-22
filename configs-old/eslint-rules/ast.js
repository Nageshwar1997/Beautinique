// @ts-check
/** What the repo's own ESLint rules (configs/eslint-rules/) read from the syntax tree. */

/** @typedef {{ value: string | number }} Value */

/** Type-only wrappers that leave the value as it is: `x as const`, `x!`, `x satisfies T`, `a?.b`. */
const WRAPPERS = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'ChainExpression',
]);

/**
 * The node under the type-only wrappers.
 * @param {any} node
 * @returns {any}
 */
export function unwrap(node) {
  let current = node;
  while (current && WRAPPERS.has(current.type)) {
    current = current.expression;
  }
  return current;
}

/**
 * The value of a plain literal (a non-empty string, a number, or a template with no `${}`);
 * null for anything else.
 * @param {any} node
 * @returns {Value | null}
 */
export function literalValue(node) {
  const current = unwrap(node);
  if (!current) {
    return null;
  }
  if (current.type === 'Literal') {
    if (typeof current.value === 'string' && current.value !== '') {
      return { value: current.value };
    }
    return typeof current.value === 'number' ? { value: current.value } : null;
  }
  if (current.type === 'TemplateLiteral' && current.expressions.length === 0) {
    const text = current.quasis[0]?.value.cooked ?? '';
    return text === '' ? null : { value: text };
  }
  return null;
}

/**
 * The names an expression is known by, outermost first: `district` → ['district'],
 * `order.hubId` → ['order', 'hubId'], `row['pincode']` → ['row', 'pincode'], `this.#role` →
 * ['role']. A part that is not a plain name (a call, `row[i]`) ends the path there; null when
 * there is no name at all.
 * @param {any} node
 * @returns {string[] | null}
 */
export function pathOf(node) {
  const current = unwrap(node);
  if (!current) {
    return null;
  }
  if (current.type === 'Identifier' || current.type === 'PrivateIdentifier') {
    return [current.name];
  }
  if (current.type === 'ThisExpression') {
    return [];
  }
  if (current.type === 'MemberExpression') {
    const property = current.computed
      ? typeof current.property.value === 'string'
        ? current.property.value
        : null
      : current.property.name;
    if (property === null || property === undefined) {
      return null;
    }
    return [...(pathOf(current.object) ?? []), property];
  }
  return null;
}

/**
 * The name an expression is known by, its last part (`order.hubId` → 'hubId'); null if none.
 * @param {any} node
 * @returns {string | null}
 */
export function nameOf(node) {
  const path = pathOf(node);
  return path === null || path.length === 0 ? null : (path.at(-1) ?? null);
}

/**
 * A name's words, lower case: `hubId` → ['hub', 'id'], `PUNE_DISTRICT` → ['pune', 'district'].
 * @param {string} name
 * @returns {string[]}
 */
export function wordsOf(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

/** The operators of an equality check. */
export const EQUALITY = new Set(['===', '!==', '==', '!=']);

/** Methods that ask whether a list or set has one value. */
export const MEMBERSHIP = new Set(['includes', 'has', 'indexOf']);

/**
 * A call `list.includes(x)` (or has, indexOf): the list and the asked value; null otherwise.
 * @param {any} node a CallExpression
 * @returns {{ list: any, value: any } | null}
 */
export function membershipOf(node) {
  const callee = unwrap(node.callee);
  if (
    !callee ||
    callee.type !== 'MemberExpression' ||
    callee.computed ||
    !MEMBERSHIP.has(callee.property.name)
  ) {
    return null;
  }
  const value = node.arguments[0];
  return value ? { list: callee.object, value } : null;
}
