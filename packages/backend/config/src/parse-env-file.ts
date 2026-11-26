import { stripBom } from './utils/strip-bom.ts';

export interface ParsedEnvFile {
  values: Record<string, string>;
  /** What is wrong, by line number. A line is never repeated here: it may hold a value. */
  problems: string[];
}

const KEY_LINE = /^([A-Z][A-Z0-9_]*)=(.*)$/;
const QUOTES = new Set(['"', "'"]);

// One pair of quotes around a value is taken off; anything else is the value, trimmed.
function valueOf(raw: string): string {
  const first = raw.charAt(0);
  if (raw.length >= 2 && QUOTES.has(first) && raw.endsWith(first)) return raw.slice(1, -1);
  return raw.trim();
}

/**
 * The text of an env file (docs/OPERATIONS.md §1 rule 9): `KEY=value` lines, and comments and empty
 * lines. Nothing else is read as a key: no `export`, no spaces before a key, no inline comment, no
 * `${...}` of another key. A key twice is a problem, not "the last one wins".
 * `firstLine` is the number of the first line when the text is a part of a bigger file.
 */
export function parseEnvFile(text: string, firstLine = 1): ParsedEnvFile {
  const values: Record<string, string> = {};
  const problems: string[] = [];
  const lines = stripBom(text).split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.trim() === '' || line.trimStart().startsWith('#')) return;
    const at = `line ${String(firstLine + index)}`;
    const match = KEY_LINE.exec(line);
    if (match === null) {
      problems.push(`${at}: not a KEY=value line (keys are UPPER_SNAKE_CASE)`);
      return;
    }
    const key = match[1] as string;
    if (Object.hasOwn(values, key)) {
      problems.push(`${at}: ${key} appears twice`);
      return;
    }
    values[key] = valueOf(match[2] as string);
  });
  return { values, problems };
}
