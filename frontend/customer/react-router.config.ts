import type { Config } from '@react-router/dev/config';

export default {
  // pages render on the server (SEO, first paint); account, cart and checkout run client-side
  ssr: true,
} satisfies Config;
