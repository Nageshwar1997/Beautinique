import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const port = 3001;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
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
});
