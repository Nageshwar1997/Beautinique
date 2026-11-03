import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const port = 3001;

/** The keys the dev server's /api proxy needs from .env. */
const DEV_KEYS = ['BQ_GATEWAY_URL', 'ORIGIN_SECRET'] as const;

/**
 * A clear error when a key of the dev proxy is missing, as the dev server starts, and only then:
 * builds need no .env, nor does React Router's prerender (/terms, /privacy), which loads this
 * config again (without saying it is a preview) for the preview server it serves the build with
 * (CI has no .env).
 */
export function devKeys(env: Record<string, string>): Plugin {
  return {
    name: 'beautinique-dev-keys',
    apply: 'serve',
    configureServer() {
      for (const key of DEV_KEYS) {
        if ((env[key]?.trim() ?? '') === '') {
          throw new Error(
            `${key} is missing in frontend/customer/.env: copy .env.example to .env (it has the laptop's values).`,
          );
        }
      }
    },
  };
}

export default defineConfig(({ command, mode, isPreview = false }) => {
  // .env on the laptop, Vercel's env in its build (and nothing in CI, where the key stays empty)
  const env = loadEnv(mode, import.meta.dirname, '');
  const gatewayUrl = (env.BQ_GATEWAY_URL ?? '').trim().replace(/\/+$/, '');
  return {
    plugins: [tailwindcss(), reactRouter(), devKeys(env)],
    // the one key the browser gets: the server's public address, for the wake-up screen's straight
    // call to its /wake (ARCHITECTURE §11.1). Nothing else of the env reaches the bundle.
    define: { 'import.meta.env.BQ_GATEWAY_URL': JSON.stringify(gatewayUrl) },
    server: {
      port,
      strictPort: true,
      // /api goes to the gateway with the origin secret, the same path the Vercel route takes in
      // production (ARCHITECTURE §7.2), with the same keys as Vercel's env, from .env (devKeys
      // stops the dev server without them)
      proxy:
        command === 'serve' && !isPreview && gatewayUrl !== ''
          ? {
              '/api': {
                target: gatewayUrl,
                headers: { 'x-origin-secret': (env.ORIGIN_SECRET ?? '').trim() },
              },
            }
          : undefined,
    },
  };
});
