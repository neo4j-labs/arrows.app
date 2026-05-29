/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/arrows-ts',

  // BUILD_EMBED=1: second entry for the VS Code webview. Relative base lets
  // assets resolve through asWebviewUri (no public root in a webview).
  base: process.env.BUILD_EMBED === '1' ? './' : '/',
  build: {
    rollupOptions: {
      input: process.env.BUILD_EMBED === '1'
        ? {
            main: resolve(__dirname, 'index.html'),
            embed: resolve(__dirname, 'embed.html'),
          }
        : { main: resolve(__dirname, 'index.html') },
    },
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
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
