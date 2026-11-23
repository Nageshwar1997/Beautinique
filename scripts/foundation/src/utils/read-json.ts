import { readFileSync } from 'node:fs';

// The repository's own manifests and configs. The result is `unknown`: whoever reads it looks at
// every field it relies on.
export function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}
