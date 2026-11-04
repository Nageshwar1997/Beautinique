import { THEME_SCRIPT } from '@beautinique/frontend-app-shell';
import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const port = 3003;

/** The keys the dev server's /api proxy needs from .env. */
const DEV_KEYS = ['BQ_GATEWAY_URL', 'ORIGIN_SECRET'] as const;

/** A clear error when a key of the dev proxy is missing, as the dev server starts (builds need no .env). */
export function devKeys(env: Record<string, string>): Plugin {
  return {
    name: 'beautinique-dev-keys',
    apply: 'serve',
    configureServer() {
      for (const key of DEV_KEYS) {
        if ((env[key]?.trim() ?? '') === '') {
          throw new Error(
            `${key} is missing in frontend/admin/.env: copy .env.example to .env (it has the laptop's values).`,
          );
        }
      }
    },
  };
}

/**
 * The saved theme applied before the first paint: the app-shell's script inline at the top of
 * <head> (a SPA renders nothing until its bundle runs, so a React <script> would come too late).
 * Byte for byte THEME_SCRIPT, so its THEME_SCRIPT_HASH allows it in a CSP.
 */
export function themeScript(): Plugin {
  return {
    name: 'beautinique-theme-script',
    transformIndexHtml: () => [{ tag: 'script', children: THEME_SCRIPT, injectTo: 'head-prepend' }],
  };
}

export default defineConfig(({ command, mode, isPreview = false }) => {
  // .env on the laptop, Vercel's env in its build (and nothing in CI, where the key stays empty)
  const env = loadEnv(mode, import.meta.dirname, '');
  const gatewayUrl = (env.BQ_GATEWAY_URL ?? '').trim().replace(/\/+$/, '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      beautiniqueFonts({ preload: ['sans'] }),
      themeScript(),
      devKeys(env),
    ],
    // the one key the browser gets: the server's public address, for the wake-up screen's straight
    // call to its /wake (ARCHITECTURE §11.1). Nothing else of the env reaches the bundle.
    define: { 'import.meta.env.BQ_GATEWAY_URL': JSON.stringify(gatewayUrl) },
    server: {
      port,
      strictPort: true,
      // /api goes to the gateway with the origin secret, the same path the Vercel route takes in
      // production (ARCHITECTURE §7.2), with the same keys as Vercel's env, from .env
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
    preview: { port, strictPort: true },
  };
});
