/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/arrows-ts',

  // BUILD_EMBED=1 enables the second entry used by the VS Code extension's bundle.
  build: {
    rollupOptions: {
      input: process.env.BUILD_EMBED === '1'
        ? {
            main: resolve(__dirname, 'index.html'),
            embed: resolve(__dirname, 'embed.html'),
          }
        : { main: resolve(__dirname, 'index.html') },
    },
    // Webview is local-only; eager modulepreload defeats the graphql lazy-load.
    modulePreload: process.env.BUILD_EMBED === '1' ? false : true,
  },

  server: {
    port: 4200,
    host: 'localhost',
    fs: { allow: ['../../'] },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({ root: '../../' }),
  ],

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
