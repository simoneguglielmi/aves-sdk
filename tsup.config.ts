import { defineConfig } from 'tsup';

/**
 *  "tsup": {
    "entry": [
      "src/index.ts"
    ],
    "dts": {
      "resolve": true,
      "tsconfig": "tsconfig.build.json"
    },
    "format": [
      "cjs",
      "esm"
    ],
    "sourcemap": true,
    "clean": true,
    "minify": true
  }
 */

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
