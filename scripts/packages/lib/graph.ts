import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CliError, isCliError } from './errors.ts';
import type { DependencyField, Workspace, WorkspacePackage } from './workspace.ts';

/** What consumers install, so what decides publish and build order. devDependencies are excluded. */
export const RUNTIME_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'] as const;
export const ALL_FIELDS = [...RUNTIME_FIELDS, 'devDependencies'] as const;

export interface InternalDependency {
  field: DependencyField;
  name: string;
  range: string;
}

export function internalDependencies(
  pkg: WorkspacePackage,
  ws: Workspace,
  fields: readonly DependencyField[] = RUNTIME_FIELDS,
): InternalDependency[] {
  const out: InternalDependency[] = [];
  for (const field of fields) {
    for (const [name, range] of Object.entries(pkg.manifest[field] ?? {})) {
      if (ws.byName.has(name) && name !== pkg.name) {
        out.push({ field, name, range });
      }
    }
  }
  return out;
}

export interface Dependent {
  pkg: WorkspacePackage;
  field: DependencyField;
  range: string;
}

/** Every workspace (packages and apps) that lists `name`, in any dependency field. */
export function dependentsOf(name: string, ws: Workspace): Dependent[] {
  const out: Dependent[] = [];
  for (const pkg of ws.packages) {
    for (const dep of internalDependencies(pkg, ws, ALL_FIELDS)) {
      if (dep.name === name) {
        out.push({ pkg, field: dep.field, range: dep.range });
      }
    }
  }
  return out;
}

/**
 * Dependencies before dependents, over edges of `fields` (runtime by default) inside `names` only.
 * Stable: unrelated packages keep their input order. A cycle is reported with its full path.
 */
export function topoSort(
  names: string[],
  ws: Workspace,
  fields: readonly DependencyField[] = RUNTIME_FIELDS,
): string[] {
  const inSet = new Set(names);
  const state = new Map<string, 'visiting' | 'done'>();
  const order: string[] = [];
  const stack: string[] = [];

  const visit = (name: string) => {
    const seen = state.get(name);
    if (seen === 'done') {
      return;
    }
    if (seen === 'visiting') {
      const cycle = [...stack.slice(stack.indexOf(name)), name];
      throw new CliError(`Circular dependency: ${cycle.join(' -> ')}`, {
        code: 'CYCLE',
        hint: 'Packages cannot depend on each other in a loop (devDependencies are fine).',
      });
    }
    state.set(name, 'visiting');
    stack.push(name);
    const pkg = ws.byName.get(name);
    if (pkg) {
      for (const dep of internalDependencies(pkg, ws, fields)) {
        if (inSet.has(dep.name)) {
          visit(dep.name);
        }
      }
    }
    stack.pop();
    state.set(name, 'done');
    order.push(name);
  };

  for (const name of names) {
    visit(name);
  }
  return order;
}

/**
 * Order for building and checking: devDependencies count too (a package's build or tests may use
 * another package's dist). A loop that only exists through devDependencies falls back to runtime order.
 */
export function buildOrder(names: string[], ws: Workspace): string[] {
  try {
    return topoSort(names, ws, ALL_FIELDS);
  } catch (error) {
    if (isCliError(error) && error.code === 'CYCLE') {
      return topoSort(names, ws);
    }
    throw error;
  }
}

/** The internal packages `names` need (any dependency field, recursively), not including `names`. */
export function internalClosure(names: string[], ws: Workspace): string[] {
  const seen = new Set(names);
  const out: string[] = [];
  const queue = [...names];
  for (let name = queue.shift(); name !== undefined; name = queue.shift()) {
    const pkg = ws.byName.get(name);
    for (const dep of pkg ? internalDependencies(pkg, ws, ALL_FIELDS) : []) {
      if (!seen.has(dep.name)) {
        seen.add(dep.name);
        out.push(dep.name);
        queue.push(dep.name);
      }
    }
  }
  return out;
}

const ENTRY_FILES = ['src/index.ts', 'src/index.tsx', 'src/index.js', 'src/index.mjs', 'index.js'];

/** Does `pkg` re-export `dep` from its entry file (`export * from 'dep'`, `export { x } from 'dep'`)? */
export function reexports(pkg: WorkspacePackage, dep: string): boolean {
  // export * from 'dep' | export * as x from 'dep' | export { a } from 'dep' | export type { A } from 'dep'
  const pattern =
    /export\s+(?:\*(?:\s+as\s+\w+)?|(?:type\s+)?\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;
  return ENTRY_FILES.some((file) => {
    const path = join(pkg.dir, file);
    if (!existsSync(path)) {
      return false;
    }
    return [...readFileSync(path, 'utf8').matchAll(pattern)].some((m) => m[1] === dep);
  });
}
