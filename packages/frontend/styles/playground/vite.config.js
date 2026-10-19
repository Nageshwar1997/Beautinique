// Playground: the package through the same pipeline as the apps (Vite + Tailwind + the font preload plugin).
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { beautiniqueFonts } from '../src/vite.js';

export default defineConfig({
  plugins: [tailwindcss(), beautiniqueFonts({ preload: ['sans', 'display'], devanagari: { storageKey: 'bq-playground-lang' } })],
  server: { port: 5180, strictPort: true },
});
