/** Changed line ranges (1-based, inclusive) per repo-relative path with forward slashes. */
export type ChangedLines = Map<string, [number, number][]>;

/**
 * Reads `git diff --unified=0` output: the new-side lines of every hunk. A pure deletion marks the
 * lines on both sides of the gap, so code right next to removed code still counts as changed.
 */
export function parseChangedLines(diff: string): ChangedLines {
  const changed: ChangedLines = new Map();
  let file: string | undefined;
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith('+++ ')) {
      const target = line.slice(4).trim();
      file = target === '/dev/null' ? undefined : target.replace(/^b\//, '');
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (!hunk || file === undefined) continue;
    const start = Number(hunk[1]);
    const length = hunk[2] === undefined ? 1 : Number(hunk[2]);
    const range: [number, number] = length === 0 ? [start, start + 1] : [start, start + length - 1];
    changed.set(file, [...(changed.get(file) ?? []), range]);
  }
  return changed;
}

/** Whether a line range overlaps any of the changed ranges. */
export function touches(
  ranges: readonly [number, number][] | undefined,
  [start, end]: [number, number],
): boolean {
  return (ranges ?? []).some(([from, to]) => start <= to && end >= from);
}
