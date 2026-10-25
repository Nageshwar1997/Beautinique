import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// the deployables from source, like npm run dev (node --conditions=beautinique-source)
export default defineConfig({
  ssr: { resolve: { conditions: ['beautinique-source', ...defaultServerConditions] } },
});
