import { defineConfig } from 'vitest/config';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [viteTsConfigPaths({ root: '../../../' })],
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    cache: { dir: '../../../node_modules/.vitest' },
  },
});
