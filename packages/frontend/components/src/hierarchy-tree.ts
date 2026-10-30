// Pure helpers over a tree of options (HierarchySelect): search, paths, what is under a branch.

/** One option of a HierarchySelect; one with `children` is a branch. */
export interface HierarchyOption {
  value: string;
  label: string;
  children?: readonly HierarchyOption[];
  /** Cannot be chosen (a branch still opens). */
  disabled?: boolean;
}

export interface TreeEntry {
  option: HierarchyOption;
  /** The values from the top down to this one's parent. */
  ancestors: readonly string[];
  /** The labels from the top down to this one, e.g. ["Makeup", "Lips", "Lipstick"]. */
  path: readonly string[];
}

/** Every option by its value. */
export function indexTree(options: readonly HierarchyOption[]): Map<string, TreeEntry> {
  const index = new Map<string, TreeEntry>();
  const walk = (
    nodes: readonly HierarchyOption[],
    ancestors: readonly string[],
    path: readonly string[],
  ) => {
    for (const option of nodes) {
      const own = [...path, option.label];
      index.set(option.value, { option, ancestors, path: own });
      if (option.children !== undefined) walk(option.children, [...ancestors, option.value], own);
    }
  };
  walk(options, [], []);
  return index;
}

export const isBranch = (option: HierarchyOption): boolean =>
  option.children !== undefined && option.children.length > 0;

/** The values of every option under this one (not itself). */
export function descendantsOf(option: HierarchyOption): string[] {
  const found: string[] = [];
  const walk = (nodes: readonly HierarchyOption[]) => {
    for (const child of nodes) {
      found.push(child.value);
      if (child.children !== undefined) walk(child.children);
    }
  };
  if (option.children !== undefined) walk(option.children);
  return found;
}

/** The values of every branch in the tree. */
export function branchValues(options: readonly HierarchyOption[]): string[] {
  const found: string[] = [];
  const walk = (nodes: readonly HierarchyOption[]) => {
    for (const option of nodes) {
      if (isBranch(option)) {
        found.push(option.value);
        walk(option.children ?? []);
      }
    }
  };
  walk(options);
  return found;
}

/**
 * The options whose label has the query (any case), each with everything under it, and the
 * branches that lead to them. `matches` counts the options found themselves.
 */
export function filterTree(
  options: readonly HierarchyOption[],
  query: string,
): { tree: readonly HierarchyOption[]; matches: number } {
  const needle = query.trim().toLocaleLowerCase('en-IN');
  if (needle === '') return { tree: options, matches: 0 };
  let matches = 0;
  const countAll = (option: HierarchyOption): void => {
    for (const child of option.children ?? []) {
      if (child.label.toLocaleLowerCase('en-IN').includes(needle)) matches += 1;
      countAll(child);
    }
  };
  const walk = (nodes: readonly HierarchyOption[]): HierarchyOption[] => {
    const kept: HierarchyOption[] = [];
    for (const option of nodes) {
      if (option.label.toLocaleLowerCase('en-IN').includes(needle)) {
        matches += 1;
        countAll(option);
        kept.push(option);
        continue;
      }
      const children = walk(option.children ?? []);
      if (children.length > 0) kept.push({ ...option, children });
    }
    return kept;
  };
  const tree = walk(options);
  return { tree, matches };
}

/**
 * A multiple choice made tidy: an option is dropped when a branch above it is chosen too (the
 * branch already means everything under it). Order is kept.
 */
export function withoutCovered(values: readonly string[], index: Map<string, TreeEntry>): string[] {
  const chosen = new Set(values);
  return values.filter(
    (value) => !(index.get(value)?.ancestors ?? []).some((ancestor) => chosen.has(ancestor)),
  );
}
