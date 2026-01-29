import esbuild from 'esbuild';
import { config } from 'dotenv';

// Load .env from shared package root
config();

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: false, // Don't bundle dependencies
  outdir: 'dist',
  format: 'esm',
  platform: 'neutral',
  target: 'es2020',
  sourcemap: true,
  define: {
    'process.env.BASE_URL_API': JSON.stringify(process.env.BASE_URL_API || '')
  }
});
