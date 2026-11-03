import type { Config } from '@react-router/dev/config';

export default {
  // pages render on the server (SEO, first paint); account, cart and checkout run client-side
  ssr: true,
  // the dummy legal pages never change between deploys: HTML at build time (ARCHITECTURE §9.2)
  prerender: ['/terms', '/privacy'],
} satisfies Config;
