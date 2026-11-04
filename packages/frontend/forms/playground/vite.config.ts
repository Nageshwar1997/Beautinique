// Playground: the forms in the same pipeline as the apps (Vite + React + Tailwind + styles).
import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), beautiniqueFonts({ preload: ['sans', 'display'] })],
  server: { port: 5185, strictPort: true },
});
