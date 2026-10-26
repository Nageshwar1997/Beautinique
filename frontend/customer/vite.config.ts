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
  const serving = command === 'serve';
  // .env on the laptop, Vercel's env in its build (and nothing in CI, where the key stays empty)
  const env = loadEnv(mode, import.meta.dirname, '');
  const gatewayUrl = (env.BQ_GATEWAY_URL ?? '').trim().replace(/\/+$/, '');
  return {
    plugins: [tailwindcss(), reactRouter()],
    // the one key the browser gets: the server's public address, for the wake-up screen's straight
    // call to its /wake (ARCHITECTURE §11.1). Nothing else of the env reaches the bundle.
    define: { 'import.meta.env.BQ_GATEWAY_URL': JSON.stringify(gatewayUrl) },
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
