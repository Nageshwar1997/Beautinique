// @ts-check
/**
 * no-hardcoded-geo (RULES §3.4, TASKS T4.10): places are data. States, districts, pincodes, hubs
 * and warehouses live in the location data (T4.2) and the network settings, never in code, so
 * opening a new district is a setting and not a deploy (ARCHITECTURE §6). The rule reports:
 *
 * 1. a string that is the whole name of a state or union territory ('Maharashtra', 'Tamil Nadu');
 * 2. a string that is a pincode (six digits, first one not 0: '411001');
 * 3. a code decision on a place: a name that says district, pincode, hub, warehouse, city, taluka,
 *    village, LGD or state id/code/name (`district`, `hubId`, `warehouseCodes`, `stateCode`)
 *    compared (===, !==, switch, includes) with a literal: `if (district === 'Pune')`;
 * 4. a state id ('MH') next to a name that says state, compared or given (`state === 'MH'`,
 *    `{ state: 'DL' }`, `const stateId = 'KA'`).
 *
 * It looks at whole values only, so 'Asia/Kolkata' or "Maharashtra, Gujarat" in a comment are not
 * places in code. The one list of states is `packages/shared/contracts/src/states.ts`; it and the
 * seed files are named in `geoDataFiles` (configs/eslint-config.js), where this rule is off.
 */

/** India's states and union territories, as in packages/shared/contracts/src/states.ts (a test keeps them equal). */
export const STATES = [
  ['AP', 'Andhra Pradesh'],
  ['AR', 'Arunachal Pradesh'],
  ['AS', 'Assam'],
  ['BR', 'Bihar'],
  ['CG', 'Chhattisgarh'],
  ['GA', 'Goa'],
  ['GJ', 'Gujarat'],
  ['HR', 'Haryana'],
  ['HP', 'Himachal Pradesh'],
  ['JH', 'Jharkhand'],
  ['KA', 'Karnataka'],
  ['KL', 'Kerala'],
  ['MP', 'Madhya Pradesh'],
  ['MH', 'Maharashtra'],
  ['MN', 'Manipur'],
  ['ML', 'Meghalaya'],
  ['MZ', 'Mizoram'],
  ['NL', 'Nagaland'],
  ['OD', 'Odisha'],
  ['PB', 'Punjab'],
  ['RJ', 'Rajasthan'],
  ['SK', 'Sikkim'],
  ['TN', 'Tamil Nadu'],
  ['TG', 'Telangana'],
  ['TR', 'Tripura'],
  ['UP', 'Uttar Pradesh'],
  ['UK', 'Uttarakhand'],
  ['WB', 'West Bengal'],
  ['AN', 'Andaman and Nicobar Islands'],
  ['CH', 'Chandigarh'],
  ['DH', 'Dadra and Nagar Haveli and Daman and Diu'],
  ['DL', 'Delhi'],
  ['JK', 'Jammu and Kashmir'],
  ['LA', 'Ladakh'],
  ['LD', 'Lakshadweep'],
  ['PY', 'Puducherry'],
];

/** Older or everyday names of the same places, which code could still carry. */
const OTHER_NAMES = [
  'Orissa',
  'Pondicherry',
  'Uttaranchal',
  'NCT of Delhi',
  'New Delhi',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Andaman and Nicobar',
  'Jammu & Kashmir',
  'Andaman & Nicobar Islands',
];

const normalize = (/** @type {string} */ text) => text.trim().replace(/\s+/g, ' ').toLowerCase();

const STATE_NAMES = new Set([...STATES.map(([, name]) => name), ...OTHER_NAMES].map(normalize));
const STATE_IDS = new Set(STATES.map(([id]) => id));
const PINCODE = /^[1-9][0-9]{5}$/;

/** Words that make a name a place (the last word of `hubId`, `warehouseCodes`, `PUNE_DISTRICT`). */
const PLACE_WORDS = new Set([
  'district',
  'pincode',
  'hub',
  'warehouse',
  'city',
  'taluka',
  'tehsil',
  'subdistrict',
  'village',
  'lgd',
]);
const PLURALS = new Map([
  ['districts', 'district'],
  ['pincodes', 'pincode'],
  ['hubs', 'hub'],
  ['warehouses', 'warehouse'],
  ['cities', 'city'],
  ['talukas', 'taluka'],
  ['tehsils', 'tehsil'],
  ['subdistricts', 'subdistrict'],
  ['villages', 'village'],
  ['states', 'state'],
]);
/** Trailing words that only say which part of a place a name holds. */
const QUALIFIERS = new Set(['id', 'ids', 'code', 'codes', 'name', 'names', 'key', 'keys']);

/**
 * What a name says about places. kind 'place': district, hub ... with or without id/code/name,
 * and a state with id/code/name (`stateId`, `stateCodes`); kind 'state': just `state`, `states`,
 * `readyState`, far more often a UI or machine state, so only a state id next to it counts.
 * `qualified`: the name holds one place's id, code or name (`hubId`, `pincode`), not a label for
 * the kind of place (`{ district: 'District' }` in a map of scope names).
 * @param {string} name
 * @returns {{ kind: 'place' | 'state' | null, qualified: boolean }}
 */
function describeName(name) {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
  let qualified = false;
  while (words.length > 1 && QUALIFIERS.has(words.at(-1) ?? '')) {
    const pair = `${words.at(-2) ?? ''}${(words.at(-1) ?? '').replace(/s$/, '')}`;
    // pinCode, postalCodes, zipCode: the code is the place
    if (pair === 'pincode' || pair === 'postalcode' || pair === 'zipcode') {
      return { kind: 'place', qualified: true };
    }
    words.pop();
    qualified = true;
  }
  const last = words.at(-1);
  // GitHub is a sign-in provider, not a hub
  if (last === undefined || (last === 'hub' && words.at(-2) === 'git')) {
    return { kind: null, qualified: false };
  }
  const word = PLURALS.get(last) ?? last;
  if (PLACE_WORDS.has(word)) {
    // a pincode or an LGD code is itself the code of one place
    return { kind: 'place', qualified: qualified || word === 'pincode' || word === 'lgd' };
  }
  if (word === 'state') {
    return qualified ? { kind: 'place', qualified: true } : { kind: 'state', qualified: false };
  }
  return { kind: null, qualified: false };
}

/**
 * What a name says about places: 'place', 'state' or null (see describeName).
 * @param {string} name
 * @returns {'place' | 'state' | null}
 */
export const placeKind = (name) => describeName(name).kind;

/** @typedef {{ value: string | number }} Value */

/**
 * The value of a plain literal (string, number, or a template with no `${}`), seen through
 * `as const` and `!`; null for anything else.
 * @param {any} node
 * @returns {Value | null}
 */
function literalValue(node) {
  let current = node;
  while (
    current &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression')
  ) {
    current = current.expression;
  }
  if (!current) {
    return null;
  }
  if (current.type === 'Literal') {
    if (typeof current.value === 'string' && current.value !== '') {
      return { value: current.value };
    }
    if (typeof current.value === 'number') {
      return { value: current.value };
    }
    return null;
  }
  if (current.type === 'TemplateLiteral' && current.expressions.length === 0) {
    const text = current.quasis[0]?.value.cooked ?? '';
    return text === '' ? null : { value: text };
  }
  return null;
}

/**
 * The name an expression is known by: `district`, `order.hubId`, `this.#warehouse`, `row['pincode']`.
 * @param {any} node
 * @returns {string | null}
 */
function nameOf(node) {
  let current = node;
  while (
    current &&
    (current.type === 'ChainExpression' ||
      current.type === 'TSAsExpression' ||
      current.type === 'TSNonNullExpression')
  ) {
    current = current.expression;
  }
  if (!current) {
    return null;
  }
  if (current.type === 'Identifier' || current.type === 'PrivateIdentifier') {
    return current.name;
  }
  if (current.type === 'MemberExpression') {
    if (!current.computed) {
      return nameOf(current.property);
    }
    return typeof current.property.value === 'string' ? current.property.value : null;
  }
  return null;
}

/** Why a value alone is a place, whatever it stands next to. */
const ownReason = (/** @type {Value} */ { value }) => {
  if (typeof value !== 'string') {
    return null;
  }
  if (STATE_NAMES.has(normalize(value))) {
    return 'stateName';
  }
  return PINCODE.test(value) ? 'pincode' : null;
};

/** @type {import('eslint').Rule.RuleModule} */
export const noHardcodedGeo = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Places (states, districts, pincodes, hubs, warehouses) are data, not code (RULES §3.4).',
    },
    schema: [],
    messages: {
      stateName:
        '"{{value}}" is a state or union territory: read places from the location data or settings, not code (RULES §3.4).',
      pincode: '"{{value}}" is a pincode: pincodes are location data, not code (RULES §3.4).',
      placeDecision:
        '`{{name}}` is compared with {{value}}: decide by settings (area settings, network), not by a place in code (RULES §3.4).',
      placeValue:
        '`{{name}}` is given {{value}} in code: places come from the location data or settings (RULES §3.4).',
      stateId:
        '"{{value}}" is a state id next to `{{name}}`: take the state from data or settings, not code (RULES §3.4).',
    },
  },
  create(context) {
    /**
     * A literal standing next to a named place.
     * @param {string | null} name
     * @param {any} literal
     * @param {'decision' | 'variable' | 'property'} where compared (===, case, includes), given
     *   to a variable, or a property's value (only a qualified key: `hubId`, not `district`)
     */
    function checkPair(name, literal, where) {
      if (name === null) {
        return;
      }
      const found = literalValue(literal);
      if (found === null || ownReason(found) !== null) {
        return;
      }
      const { kind, qualified } = describeName(name);
      if (kind === null) {
        return;
      }
      if (typeof found.value === 'string' && STATE_IDS.has(found.value)) {
        context.report({ node: literal, messageId: 'stateId', data: { name, value: found.value } });
        return;
      }
      if (kind !== 'place' || (where === 'property' && !qualified)) {
        return;
      }
      context.report({
        node: literal,
        messageId: where === 'decision' ? 'placeDecision' : 'placeValue',
        data: { name, value: JSON.stringify(found.value) },
      });
    }

    /** @param {any} node */
    function checkOwn(node) {
      const found = literalValue(node);
      const reason = found === null ? null : ownReason(found);
      if (found !== null && reason !== null) {
        context.report({ node, messageId: reason, data: { value: String(found.value) } });
      }
    }

    return {
      Literal: checkOwn,
      TemplateLiteral: checkOwn,
      /** @param {any} node */
      JSXText(node) {
        const text = String(node.value).trim();
        if (text !== '' && STATE_NAMES.has(normalize(text))) {
          context.report({ node, messageId: 'stateName', data: { value: text } });
        }
      },
      /** @param {any} node */
      BinaryExpression(node) {
        if (!['===', '!==', '==', '!='].includes(node.operator)) {
          return;
        }
        checkPair(nameOf(node.left), node.right, 'decision');
        checkPair(nameOf(node.right), node.left, 'decision');
      },
      /** @param {any} node */
      SwitchStatement(node) {
        const name = nameOf(node.discriminant);
        for (const switchCase of node.cases) {
          if (switchCase.test) {
            checkPair(name, switchCase.test, 'decision');
          }
        }
      },
      /** @param {any} node */
      CallExpression(node) {
        const callee =
          node.callee.type === 'ChainExpression' ? node.callee.expression : node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.computed ||
          !['includes', 'has', 'indexOf'].includes(callee.property.name)
        ) {
          return;
        }
        const argument = node.arguments[0];
        if (argument) {
          checkPair(nameOf(callee.object), argument, 'decision');
        }
      },
      /** @param {any} node */
      Property(node) {
        if (node.computed || node.parent?.type !== 'ObjectExpression') {
          return;
        }
        const name =
          node.key.type === 'Identifier'
            ? node.key.name
            : typeof node.key.value === 'string'
              ? node.key.value
              : null;
        checkPair(name, node.value, 'property');
      },
      /** @param {any} node */
      VariableDeclarator(node) {
        if (node.init) {
          checkPair(nameOf(node.id), node.init, 'variable');
        }
      },
    };
  },
};
