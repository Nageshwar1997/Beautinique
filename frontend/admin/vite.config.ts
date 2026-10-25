import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const port = 3003;

export default defineConfig({
  plugins: [react(), tailwindcss(), beautiniqueFonts({ preload: ['sans'] })],
  // /api goes to the local gateway, the same path the Vercel rewrite takes in production, with the
  // laptop's origin secret (public; live, Vercel sends its own, ARCHITECTURE §7.2)
  server: {
    port,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        headers: { 'x-origin-secret': 'not-a-secret-not-a-secret-not-a-secret' },
      },
    },
  },
  preview: { port, strictPort: true },
});
