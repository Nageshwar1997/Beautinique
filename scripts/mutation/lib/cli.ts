import { MutationError } from './list.ts';

/** `backend-server-queue` -> `packages/backend/server-queue`. */
export function packageDirOf(name: string): string {
  const match = /^(shared|frontend|backend)-([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(name);
  if (!match) {
    throw new MutationError(`--package must look like backend-server-queue (got "${name}")`);
  }
  return `packages/${match[1] ?? ''}/${match[2] ?? ''}`;
}

/** `3,5,12` -> [3, 5, 12]. */
export function parseOnly(value: string): number[] {
  const numbers = value.split(',').map((part) => (part.trim() === '' ? Number.NaN : Number(part)));
  if (numbers.some((n) => !Number.isInteger(n) || n < 0)) {
    throw new MutationError(`--only takes mutation numbers like 3,5,12 (got "${value}")`);
  }
  return numbers;
}
