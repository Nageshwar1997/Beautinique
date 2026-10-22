import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const port = 3003;

export default defineConfig({
  plugins: [react(), tailwindcss(), beautiniqueFonts({ preload: ['sans'] })],
  // /api goes to the local gateway, the same path the Vercel rewrite takes in production
  server: { port, strictPort: true, proxy: { '/api': 'http://localhost:8080' } },
  preview: { port, strictPort: true },
});
