import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const port = 3001;

/** A key the dev server needs from .env; a clear error when it is missing or empty. */
function required(env: Record<string, string>, key: string): string {
  const value = env[key]?.trim() ?? '';
  if (value === '') {
    throw new Error(
      `${key} is missing in frontend/customer/.env: copy .env.example to .env (it has the laptop's values).`,
    );
  }
  return value;
}

export default defineConfig(({ command, mode }) => {
  // the dev server only: a build (Vercel, react-router typegen in lint) never reads env here, so it
  // needs no .env, and .env.production's secret stays out of it
  const serving = command === 'serve';
  const env = serving ? loadEnv(mode, import.meta.dirname, '') : {};
  return {
    plugins: [tailwindcss(), reactRouter()],
    server: {
      port,
      strictPort: true,
      // /api goes to the gateway with the origin secret, the same path the Vercel route takes in
      // production (ARCHITECTURE §7.2), with the same keys as Vercel's env, from .env
      proxy: serving
        ? {
            '/api': {
              target: required(env, 'BQ_GATEWAY_URL'),
              headers: { 'x-origin-secret': required(env, 'ORIGIN_SECRET') },
            },
          }
        : undefined,
    },
  };
});
