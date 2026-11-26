// Characters of the two sides of an email address. The scan starts from each `@` and goes outwards,
// so it is one pass over the text: a regex that starts at every letter and looks for a `@` after it
// goes over a long text again and again (docs/RULES.md CR-40).
const LOCAL = /[A-Za-z0-9._%+-]/;
const DOMAIN = /[A-Za-z0-9.-]/;

/** The text with every email address taken out, as `<email>`. */
export function maskEmails(text: string): string {
  let result = '';
  let copiedTo = 0;
  let at = text.indexOf('@');
  while (at !== -1) {
    let start = at;
    while (start > copiedTo && LOCAL.test(text.charAt(start - 1))) start -= 1;
    let end = at + 1;
    while (end < text.length && DOMAIN.test(text.charAt(end))) end += 1;
    // `a@b.com.`: the dot that ends a sentence is not a part of the address.
    while (end > at + 1 && text.charAt(end - 1) === '.') end -= 1;
    const domain = text.slice(at + 1, end);
    if (start < at && domain.includes('.') && !domain.startsWith('.')) {
      result += `${text.slice(copiedTo, start)}<email>`;
      copiedTo = end;
    }
    at = text.indexOf('@', Math.max(end, at + 1));
  }
  return result + text.slice(copiedTo);
}
