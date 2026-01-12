import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: {
    resolve: true,
    entry: 'tsconfig.build.json',
  },
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: true,
  minify: true,
});
