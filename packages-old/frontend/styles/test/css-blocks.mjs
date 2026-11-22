/**
 * A small reader for our own stylesheets (enough for them, not a general CSS parser).
 *
 * parseBlocks gives every block that has declarations, in the order it first appears: its path (nested
 * selectors and at-rules joined with " > "; whitespace, commas and quotes normalised; comments dropped)
 * and its declarations. Blocks with the same path are merged. Quoted strings are respected, so a ';' or
 * '{' inside quotes splits nothing; an unquoted url() with ';' in it (a data: URL) is not supported.
 */

const normalise = (selector) =>
  selector
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replaceAll('"', "'");

/**
 * @param {string} source
 * @returns {Map<string, Map<string, string>>} path → (property → value)
 */
export function parseBlocks(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const stack = [];
  const blocks = new Map();
  let buf = '';
  let quote = '';
  const declare = () => {
    const m = /^\s*(-{0,2}[a-zA-Z][\w-]*)\s*:\s*([\s\S]*?)\s*$/.exec(buf);
    buf = '';
    if (!m || stack.length === 0) return;
    const path = stack.join(' > ');
    if (!blocks.has(path)) blocks.set(path, new Map());
    blocks.get(path).set(m[1], m[2]);
  };
  for (const ch of css) {
    if (quote) {
      buf += ch;
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
    } else if (ch === '{') {
      stack.push(normalise(buf));
      buf = '';
    } else if (ch === '}') {
      declare(); // the last declaration of a block may have no ';'
      stack.pop();
    } else if (ch === ';') {
      declare();
    } else {
      buf += ch;
    }
  }
  return blocks;
}

/** Only the custom properties (--x), per block; blocks without any are left out. */
export function customProperties(source) {
  const out = new Map();
  for (const [path, decls] of parseBlocks(source)) {
    const custom = new Map([...decls].filter(([name]) => name.startsWith('--')));
    if (custom.size > 0) out.set(path, custom);
  }
  return out;
}

/** A CSS selector as written, with escapes undone: `.\33 xl\:flex` → `.3xl:flex`. */
export function unescapeSelector(selector) {
  return selector
    .replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1');
}
