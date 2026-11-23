import { readFileSync } from 'node:fs';

// The result is `unknown`: whoever reads it looks at every field it relies on.
export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}
