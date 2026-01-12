import { defineConfig } from 'tsup';
import { join } from 'node:path';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: {
    resolve: true,
    entry: join(__dirname, 'tsconfig.build.json'),
  },
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: true,
  minify: true,
});
