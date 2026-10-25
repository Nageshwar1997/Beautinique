const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

/** Indian digit grouping: `formatNumber(123456)` → `1,23,456`. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Not a number: ${String(value)}`);
  }
  return numberFormat.format(value);
}

/** `plural(1, 'item')` → `1 item`, `plural(2341, 'rating')` → `2,341 ratings`. */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

/**
 * URL slug from any text: accents removed, `&` becomes `and`, everything else that is not a letter
 * or digit becomes a single hyphen. At most 120 characters, cut at a hyphen.
 */
export function slugify(text: string): string {
  const slug = text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replaceAll('&', ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= 120) {
    return slug;
  }
  const cut = slug.slice(0, 121);
  const at = cut.lastIndexOf('-');
  return (at > 0 ? cut.slice(0, at) : slug.slice(0, 120)).replace(/-+$/, '');
}

/** `9876543210` → `98******10` (logs, support screens; a phone is only a contact, never an OTP target). */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) {
    return '*'.repeat(digits.length);
  }
  return `${digits.slice(0, 2)}${'*'.repeat(digits.length - 4)}${digits.slice(-2)}`;
}

/** `priya.sharma@example.com` → `pr**********@example.com` (logs, "OTP sent to" messages). */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  if (at <= 0) {
    return '*'.repeat(email.length);
  }
  const local = email.slice(0, at);
  const keep = local.length > 2 ? 2 : 1;
  return `${local.slice(0, keep)}${'*'.repeat(local.length - keep)}${email.slice(at)}`;
}

/** `Priya Sharma` → `PS`, `priya` → `P` (avatars). */
export function initials(name: string, max = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const picked = words.length > max ? [...words.slice(0, max - 1), words.at(-1) ?? ''] : words;
  return picked
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase();
}

/** Shortens to at most `max` characters (by code point), ending with `…`. */
export function truncate(text: string, max: number): string {
  if (!Number.isInteger(max) || max < 1) {
    throw new RangeError(`max must be a whole number, 1 or more, got ${String(max)}`);
  }
  const chars = Array.from(text);
  if (chars.length <= max) {
    return text;
  }
  return `${chars
    .slice(0, max - 1)
    .join('')
    .trimEnd()}…`;
}
