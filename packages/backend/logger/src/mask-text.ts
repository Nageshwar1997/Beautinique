import { maskEmails } from './utils/mask-emails.ts';

// What a log may never show, found by its shape (docs/security/SECURITY_REQUIREMENTS.md SR-077,
// SR-098). Each one has a fixed shape or starts with a fixed word, so none of them goes over the
// text again and again.
const PATTERNS: readonly (readonly [RegExp, string])[] = [
  // The value of a duplicate key error: only the index stays.
  [/dup key: \{[^}]*\}/g, 'dup key: { <value> }'],
  [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer <token>'],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, '<token>'],
  // A GSTIN holds a PAN, so it comes first.
  [/\b\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/g, '<gstin>'],
  [/\b[A-Z]{3}[ABCFGHJKLPT][A-Z]\d{4}[A-Z]\b/g, '<pan>'],
  // An Indian mobile number: 10 digits from 6 to 9, with +91 or not, not a part of a longer number.
  [/(?<!\d)(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, '<phone>'],
];

/**
 * The text cut to `maxLength` characters first, then with emails, tokens, PAN, GSTIN, phone numbers
 * and the value of a duplicate key taken out. The cut comes first so that the work is bounded
 * whatever the text is (docs/RULES.md CR-40).
 */
export function maskSensitiveText(text: string, maxLength: number): string {
  const cut = text.length > maxLength ? text.slice(0, maxLength) : text;
  return PATTERNS.reduce(
    (masked, [pattern, replacement]) => masked.replace(pattern, replacement),
    maskEmails(cut),
  );
}
