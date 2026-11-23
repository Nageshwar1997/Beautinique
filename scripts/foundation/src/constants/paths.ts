import { fileURLToPath } from 'node:url';

// The repository root, the folder of the root package.json and turbo.json.
export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
