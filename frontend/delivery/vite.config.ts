import { beautiniqueFonts } from '@beautinique/frontend-styles/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const port = 3009;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    beautiniqueFonts({ preload: ['sans'] }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Beautinique Delivery',
        short_name: 'BQ Delivery',
        description: 'Run sheets, deliveries and payments for Beautinique delivery partners.',
        theme_color: '#D6336C',
        background_color: '#FDF8F5',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
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
