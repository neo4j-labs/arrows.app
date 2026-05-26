import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    cache: { dir: '../../../node_modules/.vitest' },
  },
});
