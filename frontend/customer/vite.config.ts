import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const port = 3001;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  // /api goes to the local gateway, the same path the Vercel rewrite takes in production
  server: { port, strictPort: true, proxy: { '/api': 'http://localhost:8080' } },
});
