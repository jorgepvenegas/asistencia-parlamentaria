import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'static',
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
  vite: {
    ssr: {
      external: ['better-sqlite3'],
    },
  },
});
