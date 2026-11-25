import type { Paise } from './paise.ts';

export interface FormatMoneyOptions {
  /**
   * `auto` shows the paise only when there are some (₹1,299, ₹1,299.50), for the screens of the
   * apps. `always` shows two decimals (₹1,299.00), for invoices, refunds and the finance screens
   * (docs/DESIGN.md DS-4.5).
   */
  fraction?: 'auto' | 'always';
}

// Made once: building a formatter is much slower than using it. `en-IN` groups the Indian way,
// ₹1,29,999 (docs/RULES.md CR-30).
const OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
};
const WHOLE_OR_TWO = new Intl.NumberFormat('en-IN', { ...OPTIONS, minimumFractionDigits: 0 });
const ALWAYS_TWO = new Intl.NumberFormat('en-IN', { ...OPTIONS, minimumFractionDigits: 2 });

/** An amount of paise as rupees for people, like "₹1,29,999" or "₹1,299.50". */
export function formatMoney(amount: Paise, { fraction = 'auto' }: FormatMoneyOptions = {}): string {
  const absolute = BigInt(Math.abs(amount));
  const rupees = absolute / 100n;
  const paise = absolute % 100n;
  // The amount goes to `Intl` as a decimal string, so it is read exactly: a float would not be.
  const decimal = `${amount < 0 ? '-' : ''}${String(rupees)}.${String(paise).padStart(2, '0')}`;
  const formatter = fraction === 'always' || paise !== 0n ? ALWAYS_TWO : WHOLE_OR_TWO;
  return formatter.format(decimal as `${number}`);
}
