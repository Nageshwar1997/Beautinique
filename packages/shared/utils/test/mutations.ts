// Deliberate bugs for `npm run mutate -- --package shared-utils` (RULES §6): each one must make a
// test fail, unless `survives` says why it cannot. Keep this list in step with src/: the runner
// refuses a list whose `from` text no longer occurs exactly once. It covers money.ts, the paise and
// GST arithmetic; dates, ids and text helpers are not kernel code.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  // guards
  {
    file: 'money',
    name: 'fractions of a paisa accepted',
    change: [['if (!Number.isSafeInteger(value)) {', 'if (false) {']],
  },
  {
    file: 'money',
    name: 'negative rate accepted',
    change: [[' || value < 0 || value > 10_000) {', ' || value > 10_000) {']],
  },
  {
    file: 'money',
    name: 'rate above 100% accepted',
    change: [['value > 10_000) {', 'value > 10_001) {']],
  },
  {
    file: 'money',
    name: 'fractional rate accepted',
    change: [['if (!Number.isInteger(value) || value < 0', 'if (value < 0']],
  },
  {
    file: 'money',
    name: 'result beyond safe integers accepted',
    change: [['if (!Number.isSafeInteger(result)) {', 'if (false) {']],
  },
  // rounding
  {
    file: 'money',
    name: 'negatives rounded as positives',
    change: [['const negative = numerator < 0n !== denominator < 0n;', 'const negative = false;']],
  },
  {
    file: 'money',
    name: 'halves round down',
    change: [['const rounded = (2n * n + d) / (2n * d);', 'const rounded = n / d;']],
  },
  {
    file: 'money',
    name: 'halves round up for negatives',
    change: [['return negative ? -rounded : rounded;', 'return rounded;']],
  },
  // formatINR
  {
    file: 'money',
    name: 'paise shown only when asked',
    change: [["showPaise === 'always' || (", 'false || (']],
  },
  {
    file: 'money',
    name: 'paise shown for whole rupees',
    change: [['paise % 100 !== 0) ? 2 : 0', 'paise % 100 === 0) ? 2 : 0']],
  },
  {
    file: 'money',
    name: 'paise always shown by default',
    change: [
      ["const { showPaise = 'auto' } = options;", "const { showPaise = 'always' } = options;"],
    ],
  },
  {
    file: 'money',
    name: 'rupees are paise / 10 on screen',
    change: [['.format(paise / 100);', '.format(paise / 10);']],
  },
  {
    file: 'money',
    name: 'Indian digit grouping lost',
    change: [["new Intl.NumberFormat('en-IN',", "new Intl.NumberFormat('en-US',"]],
  },
  // paiseToRupees and rupeesToPaise
  {
    file: 'money',
    name: 'paiseToRupees divides by 10',
    change: [['return paise / 100;\n}', 'return paise / 10;\n}']],
  },
  {
    file: 'money',
    name: 'infinite rupees accepted',
    change: [["if (typeof rupees === 'number' && !Number.isFinite(rupees)) {", 'if (false) {']],
  },
  {
    file: 'money',
    name: 'rupee sign not accepted',
    change: [['.replace(/^₹', '.replace(/^¥']],
  },
  {
    file: 'money',
    name: 'digit grouping not accepted',
    change: [[".replaceAll(',', '')", ".replaceAll(';', '')"]],
  },
  {
    file: 'money',
    name: 'surrounding spaces not accepted',
    change: [['String(rupees).trim()', 'String(rupees)']],
  },
  {
    file: 'money',
    name: 'three decimal places accepted',
    change: [['{1,2}))?$/.exec(text)', '{1,3}))?$/.exec(text)']],
  },
  {
    file: 'money',
    name: 'anything accepted as an amount',
    change: [['if (!match) {', 'if (false) {']],
  },
  {
    file: 'money',
    name: 'rupees count as 10 paise',
    change: [['BigInt(whole) * 100n', 'BigInt(whole) * 10n']],
  },
  {
    file: 'money',
    name: 'one decimal digit read as units',
    change: [["fraction.padEnd(2, '0')", "fraction.padStart(2, '0')"]],
  },
  {
    file: 'money',
    name: 'negative amounts lose their sign',
    change: [['sign ? -paise : paise', 'paise']],
  },
  // applyRate
  {
    file: 'money',
    name: 'rate is a tenth of what it should be',
    change: [['BigInt(basisPoints), 10_000n)', 'BigInt(basisPoints), 100_000n)']],
  },
  // taxFromInclusive
  {
    file: 'money',
    name: 'tax added to the amount instead of taken out',
    change: [['10_000n + BigInt(basisPoints)', '10_000n - BigInt(basisPoints)']],
  },
  {
    file: 'money',
    name: 'taxable scaled wrongly',
    change: [['BigInt(grossPaise) * 10_000n', 'BigInt(grossPaise) * 1_000n']],
  },
  {
    file: 'money',
    name: 'tax and taxable do not add up',
    change: [['tax: grossPaise - taxable }', 'tax: applyRate(taxable, basisPoints) }']],
  },
  {
    file: 'money',
    name: 'negative gross accepted',
    change: [['if (grossPaise < 0) {', 'if (false) {']],
  },
  // discountPercent
  {
    file: 'money',
    name: 'no MRP counts as a discount',
    change: [['if (mrpPaise <= 0 ||', 'if (mrpPaise < 0 ||']],
    survives:
      'equivalent: with an MRP of 0 the next condition (selling price at or above MRP) holds for every valid selling price',
  },
  {
    file: 'money',
    name: 'price equal to MRP counts as a discount',
    change: [['sellingPaise >= mrpPaise) {', 'sellingPaise > mrpPaise) {']],
    survives: 'equivalent: an equal price gives (0 * 100) / MRP = 0 either way',
  },
  {
    file: 'money',
    name: 'negative selling price accepted',
    change: [['if (sellingPaise < 0) {', 'if (false) {']],
  },
  {
    file: 'money',
    name: 'discount rounded up',
    change: [
      [
        '(BigInt(mrpPaise - sellingPaise) * 100n) / BigInt(mrpPaise)',
        '(BigInt(mrpPaise - sellingPaise) * 100n + BigInt(mrpPaise) - 1n) / BigInt(mrpPaise)',
      ],
    ],
  },
  // allocate
  {
    file: 'money',
    name: 'negative total accepted',
    change: [['if (total < 0) {', 'if (false) {']],
  },
  {
    file: 'money',
    name: 'no weights accepted',
    change: [['if (weights.length === 0) {', 'if (false) {']],
  },
  {
    file: 'money',
    name: 'negative weight accepted',
    change: [['!Number.isSafeInteger(weight) || weight < 0', '!Number.isSafeInteger(weight)']],
  },
  {
    file: 'money',
    name: 'fractional weight accepted',
    change: [['!Number.isSafeInteger(weight) || weight < 0', 'weight < 0']],
  },
  {
    file: 'money',
    name: 'all-zero weights accepted',
    change: [['if (sum === 0n) {', 'if (false) {']],
  },
  {
    file: 'money',
    name: 'largest remainder last',
    change: [
      [
        'b.remainder > a.remainder ? 1 : b.remainder < a.remainder ? -1',
        'b.remainder > a.remainder ? -1 : b.remainder < a.remainder ? 1',
      ],
    ],
  },
  {
    file: 'money',
    name: 'ties go to the later line',
    change: [[': a.index - b.index,', ': b.index - a.index,']],
  },
  {
    file: 'money',
    name: 'leftover paise keep being handed out',
    change: [['if (left === 0n) break;', 'if (false) break;']],
  },
  {
    file: 'money',
    name: 'two paise per leftover',
    change: [['(parts[index] ?? 0n) + 1n;', '(parts[index] ?? 0n) + 2n;']],
  },
];

export default mutations;
